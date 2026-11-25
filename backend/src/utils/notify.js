import Notification from "../models/Notification.js";

export async function notify(userId, title, message, type = "system", link = "") {
  return Notification.create({ user: userId, title, message, type, link });
}
