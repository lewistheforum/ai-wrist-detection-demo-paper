const formatVND = (money: string) => {
  const number = Number(money);
  if (isNaN(number)) {
    return "Invalid number";
  }
  return number.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

const formatDateTime = (isoDate: string) => {
  if (!isoDate) return "";

  let date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    const numeric = Number(isoDate);
    if (!Number.isNaN(numeric)) {
      const byNumber = new Date(numeric);
      if (!Number.isNaN(byNumber.getTime())) {
        date = byNumber;
      }
    }
  }

  if (Number.isNaN(date.getTime())) {
    const normalized = isoDate.replace(" ", "T");
    const byNormalized = new Date(normalized);
    if (!Number.isNaN(byNormalized.getTime())) {
      date = byNormalized;
    }
  }

  if (Number.isNaN(date.getTime())) return "";

  const timeStr = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);

  const dateStr = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);

  return `${timeStr} - ${dateStr}`;
};

const formatToDateTimeLocal = (isoDate: string | number | Date) => {
  if (!isoDate) return "";

  let date = new Date(isoDate);

  if (Number.isNaN(date.getTime()) && typeof isoDate === "string") {
    const normalized = isoDate.replace(" ", "T");
    const byNormalized = new Date(normalized);
    if (!Number.isNaN(byNormalized.getTime())) {
      date = byNormalized;
    }
  }

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const sanitizeContent = (html: string) => {
  return html.replace(/<img[^>]*>/g, "");
};

const formatProvinceName = (name: string) => {
  if (!name) return "";
  return name.replace(/^(Tỉnh|Thành phố)\s+/i, "");
};

const getNameForSorting = (name: string) => {
  if (!name) return "";
  const prefixes = [
    "Tỉnh",
    "Thành phố",
    "Quận",
    "Huyện",
    "Thị xã",
    "Phường",
    "Xã",
    "Thị trấn",
  ];
  const regex = new RegExp(`^(${prefixes.join("|")})\\s+`, "i");
  return name.replace(regex, "");
};

export const HELPER = {
  formatVND,
  formatDate,
  formatDateTime,
  formatToDateTimeLocal,
  sanitizeContent,
  formatProvinceName,
  getNameForSorting,
};
