/**
 * 미리보기 카드를 저장용 이미지 한 장으로 합성한다.
 *
 * DOM을 그대로 캡처(html2canvas 등)하지 않는 이유가 두 가지 있다.
 * 첫째, 카드가 쓰는 liquid-glass-react는 backdrop-filter 기반인데 캡처 라이브러리들이
 * 이를 재현하지 못해 유리 질감이 통째로 날아간다. 둘째, 저장할 그림은 화면과 구성이
 * 다르다. 제목과 버튼 없이 배경 위에 카드만 놓인 형태라 어차피 새로 그려야 한다.
 *
 * 배경을 우리가 직접 그리므로, 카드 뒤를 블러 처리해 유리 질감을 오히려 정확하게 낼 수 있다.
 */

/** 합성 기준이 되는 논리 크기(CSS px). 실제 출력은 여기에 SCALE을 곱한다. */
const CANVAS_WIDTH = 375;
const CANVAS_HEIGHT = 667;
const SCALE = 3;

/** 카드 치수. ConfirmPage의 Panel과 같은 값을 유지해야 한다. */
const CARD_WIDTH = 272;
const CARD_HEIGHT = 388;
const CARD_RADIUS = 20;
const CARD_PADDING = 11;

/** 카드 내부. imagePreview 높이와 messagePreview 간격은 ConfirmPage.module.css와 같다. */
const PHOTO_HEIGHT = 228;
const PHOTO_RADIUS = 10;
const PHOTO_GAP = 4;

const MESSAGE_FONT_SIZE = 12;
const MESSAGE_LINE_HEIGHT = 1.45;
const CAPTION_FONT_SIZE = 14;
const CAPTION_LINE_HEIGHT = 1.4;

const DISPLAY_FONT = '"Diphylleia", serif';
const SERIF_FONT = '"Noto Serif KR", serif';

/** global.css의 --gradient-image-scrim */
const SCRIM = "rgba(0, 0, 0, 0.65)";

const SIGNATURE_TEXT = "삶으로 쓰는 예배전 (展)";

export type ExhibitCardInput = {
  /** 전시할 사진 (준비 화면에서 변환한 webp) */
  photo: Blob;
  message: string;
  /** "2026.08.14" 형태 */
  dateText: string;
  backgroundImageUrl: string;
};

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`이미지를 불러오지 못했습니다: ${src}`));
    image.src = src;
  });

/**
 * object URL은 그리기가 끝난 뒤에 해제해야 한다. onload 직후에 지우면 일부 브라우저에서
 * 아직 그리지 않은 이미지가 깨진다. 그래서 해제 함수를 함께 돌려준다.
 */
const loadImageFromBlob = async (
  blob: Blob,
): Promise<{ image: HTMLImageElement; revoke: () => void }> => {
  const url = URL.createObjectURL(blob);

  try {
    return { image: await loadImage(url), revoke: () => URL.revokeObjectURL(url) };
  } catch (cause) {
    URL.revokeObjectURL(url);
    throw cause;
  }
};

/**
 * 캔버스는 웹폰트가 로드되기 전에 그리면 조용히 대체 폰트로 그려버린다.
 * 화면과 저장 이미지의 글꼴이 달라지는 것을 막기 위해 먼저 기다린다.
 *
 * 그릴 문자열을 반드시 함께 넘겨야 한다. 두 폰트 모두 @fontsource가 unicode-range로
 * 100개 안팎의 조각으로 쪼개 두었는데, 인자를 생략하면 브라우저는 기본 검사 문자열
 * "BESbswy"만 확인해서 라틴 조각만 불러오고 정작 필요한 한글 조각은 빠진 채로
 * 준비가 끝났다고 답한다. 개발 서버에서는 폰트가 즉시 도착해 티가 나지 않지만,
 * 배포 환경에서는 저장 이미지만 시스템 기본 글꼴로 찍히게 된다.
 *
 * 줄바꿈 계산(measureText)도 이 대기 이후에 해야 글자 폭이 실제와 맞는다.
 */
const ensureFontsReady = async (messageText: string, captionText: string) => {
  if (!document.fonts) {
    return;
  }

  await Promise.all([
    document.fonts.load(`${MESSAGE_FONT_SIZE}px ${DISPLAY_FONT}`, messageText),
    document.fonts.load(`${CAPTION_FONT_SIZE}px ${SERIF_FONT}`, captionText),
  ]);
};

/** ctx.roundRect는 iOS 16.4 이상에서만 쓸 수 있어 없는 환경을 위한 경로를 함께 둔다. */
const roundedRectPath = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  ctx.beginPath();

  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, width, height, radius);
    return;
  }

  const r = Math.min(radius, width / 2, height / 2);

  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
};

/** object-fit: cover 와 같은 방식으로 그린다. */
const drawCover = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) => {
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;

  ctx.drawImage(
    image,
    x + (width - drawWidth) / 2,
    y + (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
};

/** 주어진 폭에 맞춰 줄바꿈한다. 사용자가 직접 넣은 개행도 존중한다. */
const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] => {
  const lines: string[] = [];

  for (const paragraph of text.split("\n")) {
    if (paragraph === "") {
      lines.push("");
      continue;
    }

    let current = "";

    for (const char of paragraph) {
      const next = current + char;

      if (ctx.measureText(next).width > maxWidth && current !== "") {
        lines.push(current);
        current = char;
      } else {
        current = next;
      }
    }

    lines.push(current);
  }

  return lines;
};

export const renderExhibitCard = async ({
  photo,
  message,
  dateText,
  backgroundImageUrl,
}: ExhibitCardInput): Promise<Blob> => {
  const captionLines = [dateText, SIGNATURE_TEXT];

  const [background, loadedPhoto] = await Promise.all([
    loadImage(backgroundImageUrl),
    loadImageFromBlob(photo),
    ensureFontsReady(message, captionLines.join("")),
  ]);

  const photoImage = loadedPhoto.image;

  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH * SCALE;
  canvas.height = CANVAS_HEIGHT * SCALE;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("캔버스를 만들 수 없습니다.");
  }

  ctx.scale(SCALE, SCALE);
  ctx.textBaseline = "top";

  const cardX = (CANVAS_WIDTH - CARD_WIDTH) / 2;
  const cardY = (CANVAS_HEIGHT - CARD_HEIGHT) / 2;

  // 1. 배경 + 스크림
  drawCover(ctx, background, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = SCRIM;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 2. 유리 카드.
  //    backdrop-filter를 흉내내기 위해 카드 영역에만 배경을 다시, 흐리게 겹쳐 그린다.
  ctx.save();
  roundedRectPath(ctx, cardX, cardY, CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS);
  ctx.clip();

  const supportsFilter = "filter" in ctx;

  if (supportsFilter) {
    ctx.filter = "blur(16px)";
    drawCover(ctx, background, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.filter = "none";
  }

  ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
  ctx.fillRect(cardX, cardY, CARD_WIDTH, CARD_HEIGHT);
  ctx.restore();

  ctx.save();
  roundedRectPath(ctx, cardX, cardY, CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // 3. 사진
  const contentX = cardX + CARD_PADDING;
  const contentY = cardY + CARD_PADDING;
  const contentWidth = CARD_WIDTH - CARD_PADDING * 2;

  ctx.save();
  roundedRectPath(ctx, contentX, contentY, contentWidth, PHOTO_HEIGHT, PHOTO_RADIUS);
  ctx.clip();
  drawCover(ctx, photoImage, contentX, contentY, contentWidth, PHOTO_HEIGHT);
  ctx.restore();

  // 4. 메시지와 서명. messagePreview는 space-between이라 위아래로 붙는다.
  const messageTop = contentY + PHOTO_HEIGHT + PHOTO_GAP;
  const messageBottom = cardY + CARD_HEIGHT - CARD_PADDING;

  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
  ctx.shadowOffsetY = 2;
  ctx.shadowBlur = 4;

  const captionLineHeight = CAPTION_FONT_SIZE * CAPTION_LINE_HEIGHT;
  const captionTop = messageBottom - captionLineHeight * captionLines.length;

  ctx.font = `${MESSAGE_FONT_SIZE}px ${DISPLAY_FONT}`;

  const messageLineHeight = MESSAGE_FONT_SIZE * MESSAGE_LINE_HEIGHT;
  // 서명을 침범하지 않도록 들어갈 수 있는 줄까지만 그린다.
  // 입력은 100자로 제한되어 있어 보통은 잘리지 않지만, 개행을 많이 넣으면 넘칠 수 있다.
  const maxMessageLines = Math.max(
    1,
    Math.floor((captionTop - messageTop) / messageLineHeight),
  );

  const allLines = wrapText(ctx, message, contentWidth);
  const messageLines = allLines.slice(0, maxMessageLines);

  if (allLines.length > maxMessageLines) {
    messageLines[maxMessageLines - 1] =
      `${messageLines[maxMessageLines - 1].slice(0, -1)}…`;
  }

  messageLines.forEach((line, index) => {
    ctx.fillText(line, contentX, messageTop + index * messageLineHeight);
  });

  ctx.font = `${CAPTION_FONT_SIZE}px ${SERIF_FONT}`;
  ctx.shadowColor = "transparent";

  captionLines.forEach((line, index) => {
    ctx.fillText(line, contentX, captionTop + index * captionLineHeight);
  });

  try {
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error("이미지를 만들지 못했습니다.")),
        "image/png",
      );
    });
  } finally {
    loadedPhoto.revoke();
  }
};
