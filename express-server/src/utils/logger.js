import { createLogger, format, transports as winstonTransports } from "winston";
import "winston-daily-rotate-file";

// Define log format
const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);

// Setup transports
const loggerTransports = [
  new winstonTransports.Console(),
];

// Skip file logging in test environment
if (process.env.NODE_ENV !== "test") {
  loggerTransports.push(
    new winstonTransports.DailyRotateFile({
      dirname: "logs",
      filename: "%DATE%-app.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
    })
  );
}

// Create logger instance
export const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: logFormat,
  transports: loggerTransports,
});
