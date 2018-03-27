const embeds = require("./embeds")
import _ from "lodash"

const createText = (chId, txt, extra = {}) => {

  let raw = Object.assign({
    channelId: chId,
    message: txt.trim()
  }, extra);

  return {
    platform: "discord",
    type: "text",
    text: (typeof txt === "string") ? txt : "",
    raw: raw
  }
}

const createAttachment = (chId, description, uri) => {
  var filename = uri.split('/').pop().split('#')[0].split('?')[0]
  return {
    platform: "discord",
    type: "attachment",
    text: description,
    raw: {
      filename: filename,
      uri: uri,
      channelId: chId
    }
  }
}

const createImage = (chId, uri, filetype) => {
  return {
    platform: "discord",
    type: "image",
    text: "",
    raw: {
      uri: uri,
      channelId: chId,
      type: filetype || "png"
    }
  }
}

const createTextUpdate = (chId, msgId, content) => {
  return {
    platform: "discord",
    type: "textUpdate",
    text: "",
    raw: {
      channelId: chId,
      msgId: msgId,
      msg: content
    }
  }
}
/*
const createTyping = (chId, txt, extra = {}) => {

  let raw = Object.assign({
    channelId: chId,
    message: txt.trim()
  }, extra);

  return {
    platform: "discord",
    type: "typing",
    text: "",
    raw: raw
  }
}
*/
module.exports = {
  createText,
  createAttachment,
  createImage,
  createTextUpdate
}
