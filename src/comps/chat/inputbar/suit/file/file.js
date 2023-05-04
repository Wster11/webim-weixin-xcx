let WebIM = require("../../../../../utils/WebIM")["default"];
let msgType = require("../../../msgtype");
let disp = require("../../../../../utils/broadcast");
Component({
  properties: {
    username: {
      type: Object,
      value: {}
    },
    chatType: {
      type: String,
      value: msgType.chatType.SINGLE_CHAT
    }
  },
  data: {},
  methods: {
    sendFileMessage() {
      wx.chooseMessageFile({
        count: 1,
        success(res) {
          var domain = wx.WebIM.conn.apiUrl + "/";
          var str = WebIM.config.appkey.split("#");
          var tempFiles = res.tempFiles;
          var token = WebIM.conn.context.accessToken;
          var index = tempFiles[0].name.lastIndexOf(".");
          var filetype = (~index && tempFiles[0].name.slice(index + 1)) || "";
          wx.uploadFile({
            url: domain + str[0] + "/" + str[1] + "/chatfiles",
            filePath: tempFiles[0].path,
            name: "file",
            header: {
              "Content-Type": "multipart/form-data",
              Authorization: "Bearer " + token
            },
            success(res) {
              var data = res.data;
              var dataObj = JSON.parse(data);
              var id = WebIM.conn.getUniqueId(); // 生成本地消息 id
              var msg = new WebIM.message(msgType.FILE, id);
              var file = {
                type: msgType.FILE,
                url: dataObj.uri + "/" + dataObj.entities[0].uuid,
                filetype: filetype,
                filename: tempFiles[0].name,
                file_length: tempFiles[0].size
              };
              msg.set({
                apiUrl: WebIM.config.apiURL,
                body: file,
                from: me.data.username.myName,
                to: me.getSendToParam(),
                roomType: false,
                chatType: me.data.chatType,
                success: function (argument) {
                  disp.fire("em.chat.sendSuccess", id);
                }
              });
              if (me.data.chatType == msgType.chatType.CHAT_ROOM) {
                msg.setGroup("groupchat");
              }
              WebIM.conn.send(msg.body);
              me.triggerEvent(
                "newFileMsg",
                {
                  msg: msg,
                  type: msgType.FILE
                },
                {
                  bubbles: true,
                  composed: true
                }
              );
            }
          });
        }
      });
    },

    isGroupChat() {
      return this.data.chatType == msgType.chatType.CHAT_ROOM;
    },

    getSendToParam() {
      return this.isGroupChat()
        ? this.data.username.groupId
        : this.data.username.your;
    }
  }
});
