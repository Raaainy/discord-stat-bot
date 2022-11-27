const moment = require("moment");
require("moment-duration-format");
const conf = require("../configs/config.json");
const messageUserChannel = require("../schemas/messageUserChannel");
const voiceUserChannel = require("../schemas/voiceUserChannel");
const messageUser = require("../schemas/messageUser");
const voiceUser = require("../schemas/voiceUser");
const voiceUserParent = require("../schemas/voiceUserParent");

module.exports = {
  conf: {
    aliases: [],
    name: 'me',
    help: "me"
  },

  run: async (client, message, args, embed) => {
    const category = async (parentsArray) => {
      const data = await voiceUserParent.find({ guildID: message.guild.id, userID: message.author.id });
      const voiceUserParentData = data.filter((x) => parentsArray.includes(x.parentID));
      let voiceStat = 0;
      for (var i = 0; i <= voiceUserParentData.length; i++) {
        voiceStat += voiceUserParentData[i] ? voiceUserParentData[i].parentData : 0;
      }
      return moment.duration(voiceStat).format("H [saat], m [dakika]");
    };
    
    const Active1 = await messageUserChannel.find({ guildID: message.guild.id, userID: message.author.id }).sort({ channelData: -1 });
    const Active2 = await voiceUserChannel.find({ guildID: message.guild.id, userID: message.author.id }).sort({ channelData: -1 });
    const voiceLength = Active2 ? Active2.length : 0;
    let voiceTop;
    let messageTop;
    Active1.length > 0 ? messageTop = Active1.splice(0, 5).map(x => `<#${x.channelID}>: \`${Number(x.channelData).toLocaleString()} mesaj\``).join("\n") : messageTop = "Veri bulunmuyor."
    Active2.length > 0 ? voiceTop = Active2.splice(0, 5).map(x => `<#${x.channelID}>: \`${moment.duration(x.channelData).format("H [saat], m [dakika]")}\``).join("\n") : voiceTop = "Veri bulunmuyor."
    
    const ovospucou = await messageUser.findOne({ guildID: message.guild.id, userID: message.author.id });
    const kirmizibalikgolde = await voiceUser.findOne({ guildID: message.guild.id, userID: message.author.id });

    const RainyMessageDaily = ovospucou ? ovospucou.dailyStat : 0;
    const RainyMessageWeekly = ovospucou ? ovospucou.weeklyStat : 0;

    const voiceDaily = moment.duration(kirmizibalikgolde ? kirmizibalikgolde.dailyStat : 0).format("H [saat], m [dakika]");
    const voiceWeekly = moment.duration(kirmizibalikgolde ? kirmizibalikgolde.weeklyStat : 0).format("H [saat], m [dakika]");

    const filteredParents = message.guild.channels.cache.filter((x) =>
      x.type === "category" &&
      !conf.publicParents.includes(x.id) &&
      !conf.privateParents.includes(x.id) 
    );

    embed.setThumbnail(message.author.avatarURL({ dynamic: true, size: 2048 }))
    embed.setFooter("Rainy 💗 Mert");
    embed.setDescription(`
    ${message.author.toString()} üyesinin sunucu verileri
    **───────────────**
    **➥ Ses Bilgileri:**
  • Toplam: \`${moment.duration(kirmizibalikgolde ? kirmizibalikgolde.topStat : 0).format("H [saat], m [dakika]")}\`
  • Genel Ses Odaları: \`${await category(conf.publicParents)}\`
  • Özel Ses Odaları: \`${await category(conf.privateParents)}\`
  • Diğer: \`${await category(filteredParents.map(x => x.id))}\`
    **───────────────**
    **➥ Sesli Kanal Bilgileri: (\`Toplam ${voiceLength} kanal\`)**
    ${voiceTop}
    **───────────────**
    **➥ Mesaj Bilgileri: (\`Toplam ${ovospucou ? ovospucou.topStat : 0} mesaj\`)**
    ${messageTop}
    **───────────────**
    `)
    embed.addField("➥ Günlük Verileri:", `
    Mesaj: \`${Number(RainyMessageDaily).toLocaleString()} mesaj\`
    Ses: \`${voiceDaily}\`
    `, true);
    embed.addField("➥ Haftalık Verileri:", `
    Mesaj: \`${Number(RainyMessageWeekly).toLocaleString()} mesaj\`
    Ses: \`${voiceWeekly}\`
    `, true);
    message.channel.send(embed);
  }
};