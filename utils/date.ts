const padStartNumber = (num: number, stringLength = 2) => num.toString().padStart(stringLength, '0');

const toISOWithOffset = (date: Date) => {
  const offsetInMinutes = date.getTimezoneOffset();

  const offsetHours = Math.abs(Math.floor(offsetInMinutes / 60));
  const offsetMinutes = Math.abs(offsetInMinutes % 60);
  const offsetSign = offsetInMinutes < 0 ? '+' : '-';
  const formattedOffset = `${offsetSign}${padStartNumber(offsetHours)}:${padStartNumber(offsetMinutes)}`;

  const year = date.getFullYear();
  const month = padStartNumber(date.getMonth() + 1);
  const day = padStartNumber(date.getDate());
  const hours = padStartNumber(date.getHours());
  const minutes = padStartNumber(date.getMinutes());
  const seconds = padStartNumber(date.getSeconds());
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${formattedOffset}`;
};

const toUTCDateString = (date: Date) => {
  const currentTimeZoneOffsetInHours = date.getTimezoneOffset() / 60;
  date.setHours(date.getHours() + currentTimeZoneOffsetInHours);

  return date.toISOString();
};

export const dateUtils = {
  padStartNumber,
  toISOWithOffset,
  toUTCDateString
};
