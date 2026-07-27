/**
 * yyyy.MM.dd로 포매팅된 오늘 날짜를 반환하는 헬퍼 함수
 * @returns {string} - yyyy.MM.dd로 포매팅된 오늘 날짜
 */
export const getCurrentDate = () => {
  const today = new Date();

  const yyyy = today.getFullYear();
  // Months are 0-indexed, so add 1
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  return `${yyyy}.${mm}.${dd}`;
};
