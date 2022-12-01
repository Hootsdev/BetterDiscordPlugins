/**
 * @name EZShare
 * @author Ahlawat
 * @authorId 1025214794766221384
 * @version 1.0.0
 * @invite SgKSKyh9gY
 * @description Adds a slash command to share download info and file for plugins and themes.
 * @website https://tharki-god.github.io/
 * @source https://github.com/Tharki-God/BetterDiscordPlugins
 * @updateUrl https://raw.githubusercontent.com/Tharki-God/BetterDiscordPlugins/master/EZShare.plugin.js
 */
/*@cc_on
@if (@_jscript)
var shell = WScript.CreateObject("WScript.Shell");
var fs = new ActiveXObject("Scripting.FileSystemObject");
var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
var pathSelf = WScript.ScriptFullName;
shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
} else if (!fs.FolderExists(pathPlugins)) {
shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
} else if (shell.Popup("Should I move myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
fs.MoveFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)));
shell.Exec("explorer " + pathPlugins);
shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
}
WScript.Quit();
@else@*/
module.exports = (() => {
    const config = {
      info: {
        name: "EZShare",
        authors: [
          {
            name: "Ahlawat",
            discord_id: "1025214794766221384",
            github_username: "Tharki-God",
          },
        ],
        version: "1.0.0",
        description:
          "Adds a slash command to share download info and file for plugins and themes.",
        github: "https://github.com/Tharki-God/BetterDiscordPlugins",
        github_raw:
          "https://raw.githubusercontent.com/Tharki-God/BetterDiscordPlugins/master/EZShare.plugin.js",
      },
      changelog: [
        {
          title: "v0.0.1",
          items: ["Idea in mind"],
        },
        {
          title: "v0.0.5",
          items: ["Base Model"],
        },
        {
          title: "Initial Release v1.0.0",
          items: [
            "This is the initial release of the plugin :)",
            "Well share those illegal plugins with ezzz now ...( ＿ ＿)ノ｜",
          ],
        },
      ],
      main: "EZShare.plugin.js",
    };
    return !window.hasOwnProperty("ZeresPluginLibrary")
      ? class {
          load() {
            BdApi.showConfirmationModal(
              "ZLib Missing",
              `The library plugin (ZeresPluginLibrary) needed for ${config.info.name} is missing. Please click Download Now to install it.`,
              {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onConfirm: () => this.downloadZLib(),
              }
            );
          }
          async downloadZLib() {
            const fs = require("fs");
            const path = require("path");
            const ZLib = await fetch(
              "https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js"
            );
            if (!ZLib.ok) return this.errorDownloadZLib();
            const ZLibContent = await ZLib.text();
            try {
              await fs.writeFile(
                path.join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"),
                ZLibContent,
                (err) => {
                  if (err) return this.errorDownloadZLib();
                }
              );
            } catch (err) {
              return this.errorDownloadZLib();
            }
          }
          errorDownloadZLib() {
            const { shell } = require("electron");
            BdApi.showConfirmationModal(
              "Error Downloading",
              [
                `ZeresPluginLibrary download failed. Manually install plugin library from the link below.`,
              ],
              {
                confirmText: "Download",
                cancelText: "Cancel",
                onConfirm: () => {
                  shell.openExternal(
                    "https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js"
                  );
                },
              }
            );
          }
          start() {}
          stop() {}
        }
      : (([Plugin, Library]) => {
          const {
            WebpackModules,
            PluginUpdater,
            Logger,
            Patcher,
            Utilities,
            Settings: { SettingPanel, Switch },
            DiscordModules: { MessageActions },
          } = Library;
          const { Plugins, Themes } = BdApi;  
          const fs = require("fs");
          const path = require("path");    
          const UploadModule = WebpackModules.getByProps("cancel", "upload");
          const FakeMessage = {
            DiscordConstants: WebpackModules.getModule(
              (m) => m?.Plq?.ADMINISTRATOR == 8n
            ),
            TimestampUtils: WebpackModules.getByProps("fromTimestamp"),
            UserStore: WebpackModules.getByProps("getCurrentUser", "getUser"),
            get makeMessage() {
              return (channelId, content, embeds) => ({
                id: this.TimestampUtils.fromTimestamp(Date.now()),
                type: this.DiscordConstants.uaV.DEFAULT,
                flags: this.DiscordConstants.iLy.EPHEMERAL,
                content: content,
                channel_id: channelId,
                author: this.UserStore.getCurrentUser(),
                attachments: [],
                embeds: null != embeds ? embeds : [],
                pinned: false,
                mentions: [],
                mention_channels: [],
                mention_roles: [],
                mention_everyone: false,
                timestamp: new Date().toISOString(),
                state: this.DiscordConstants.yb.SENT,
                tts: false,
              });
            },
          };        
          const defaultSettings = {
            plugins: true,
            themes: true,
          };
          const SlashCommandAPI = (window.SlashCommandAPI ||= (() => {
            const ApplicationCommandStore = WebpackModules.getModule((m) =>
              m?.A3?.toString().includes(".Tm")
            );
            const IconUtils = WebpackModules.getByProps("getApplicationIconURL");
            const UserStore = WebpackModules.getByProps(
              "getCurrentUser",
              "getUser"
            );
            const CurrentUser = UserStore.getCurrentUser();
            const CurrentUserSection = {
              id: CurrentUser.id,
              name: CurrentUser.username,
              type: 1,
              icon: CurrentUser.avatar,
            };
            const commands = new Map();
            const register = (name, command) => {
              (command.applicationId = CurrentUser.id),
                (command.id = `${CurrentUser.username}_${
                  commands.size + 1
                }`.toLowerCase());
              commands.set(name, command);
              ApplicationCommandStore.ZP.shouldResetAll = true;
            };
            const unregister = (name) => {
              commands.delete(name);
              ApplicationCommandStore.ZP.shouldResetAll = true;
            };
            Patcher.after(ApplicationCommandStore, "A3", (_, args, res) => {
              if (!res || !commands.size) return;
              if (
                !Array.isArray(res.sectionDescriptors) ||
                !res.sectionDescriptors.some(
                  (section) => section.id == CurrentUserSection.id
                )
              )
                res.sectionDescriptors = Array.isArray(res.sectionDescriptors)
                  ? res.sectionDescriptors.splice(1, 0, CurrentUserSection)
                  : [CurrentUserSection];
                  if (
                    !Array.isArray(res.commands) ||
                    Array.from(commands.values()).some(
                      (command) => !res.commands.includes(command)
                    )
                  )
                    res.commands = Array.isArray(res.commands)
                      ? [
                          ...res.commands.filter(
                            (command) =>
                              !Array.from(commands.values()).includes(command)
                          ),
                          ...Array.from(commands.values()),
                        ]
                      : Array.from(commands.values());
            });
            Patcher.after(
              ApplicationCommandStore.ZP,
              "getChannelState",
              (_, args, res) => {
                if (!res || !commands.size) return;
                if (
                  !Array.isArray(res.applicationSections) ||
                  !res.applicationSections.some(
                    (section) => section.id == CurrentUserSection.id
                  )
                )
                  res.applicationSections = Array.isArray(res.applicationSections)
                    ? [CurrentUserSection, ...res.applicationSections]
                    : [CurrentUserSection];
                if (
                  !Array.isArray(res.applicationCommands) ||
                  Array.from(commands.values()).some(
                    (command) => !res.applicationCommands.includes(command)
                  )
                )
                  res.applicationCommands = Array.isArray(res.applicationCommands)
                    ? [
                        ...res.applicationCommands.filter(
                          (command) =>
                            !Array.from(commands.values()).includes(command)
                        ),
                        ...Array.from(commands.values()),
                      ]
                    : Array.from(commands.values());
              }
            );
            Patcher.instead(
              IconUtils,
              "getApplicationIconURL",
              (_, args, res) => {
                if (args[0].id == CurrentUser.id)
                  return IconUtils.getUserAvatarURL(CurrentUser);
                return res(...args);
              }
            );
            return {
              commands,
              register,
              unregister,
            };
          })());
          return class EZShare extends Plugin {
            constructor() {
              super();
              this.settings = Utilities.loadData(
                config.info.name,
                "settings",
                defaultSettings
              );
            }
            checkForUpdates() {
              try {
                PluginUpdater.checkForUpdate(
                  config.info.name,
                  config.info.version,
                  config.info.github_raw
                );
              } catch (err) {
                Logger.err("Plugin Updater could not be reached.", err);
              }
            }
            start() {
              this.checkForUpdates();
              this.addCommand();
            }
            addCommand() {
                if (this.settings["plugins"])
                  SlashCommandAPI.register("EZSharePlugins", {
                    name: "share plugin",
                    displayName: "share plugin",
                    displayDescription:
                      "Shares Download link and additional info for the specified Plugin.",
                    description:
                      "Shares Download link and additional info for the specified Plugin.",
                    type: 1,
                    target: 1,
                    execute: ([send, info, pluginID], { channel }) => {
                      try {
                        const Plugin = Plugins.get(pluginID.value);
                        if (send.value) {
                          const PluginData = fs.readFileSync(path.join(Plugins.folder, Plugin.filename), 'utf8');
                          const PluginText = new Blob([PluginData], { type: "text/plain" });
                          const JSFileToUpload = new File([PluginText], Plugin.filename);
                          UploadModule.upload({
                            channelId: channel.id,
                            file: JSFileToUpload,
                            draftType: null,
                            message: "",
                          });
                          info.value
                            ? MessageActions.sendMessage(
                                channel.id,
                                {
                                  content: `**${Plugin.name}** \n ${
                                    Plugin.description
                                  } \n\n ${
                                    Plugin.filename
                                      ? `Filename: ${Plugin.filename} \n`
                                      : ""
                                  } ${
                                    Plugin.version
                                      ? `Version: ${Plugin.version} \n`
                                      : ""
                                  } ${
                                    Plugin.updateUrl
                                      ? `Download Link: ${Plugin.updateUrl} \n`
                                      : ""
                                  } ${
                                    Plugin.source
                                      ? `Source Website: ${Plugin.source} \n`
                                      : ""
                                  } ${
                                    Plugin.invite
                                      ? `Support server: https://discord.gg/${Plugin.invite}`
                                      : ""
                                  }`,
                                  tts: false,
                                  invalidEmojis: [],
                                  validNonShortcutEmojis: [],
                                },
                                undefined,
                                {}
                              )
                            : Plugin.updateUrl
                            ? MessageActions.sendMessage(
                                channel.id,
                                {
                                  content: Plugin.updateUrl,
                                  tts: false,
                                  invalidEmojis: [],
                                  validNonShortcutEmojis: [],
                                },
                                undefined,
                                {}
                              )
                            : MessageActions.receiveMessage(
                                channel.id,
                                FakeMessage.makeMessage(
                                  channel.id,
                                  "Plugin Don't Have a download Link."
                                )
                              );
                        } else
                          info.value
                            ? MessageActions.receiveMessage(
                                channel.id,
                                FakeMessage.makeMessage(channel.id, "", [
                                  {
                                    type: "rich",
                                    title: Plugin.name,
                                    description: Plugin.description,
                                    color: "6577E6",
                                    thumbnail: {
                                      url: "https://tharki-god.github.io/assets/connections/plugin.png",
                                      proxyURL:
                                        "https://tharki-god.github.io/assets/connections/plugin.png",
                                      width: 400,
                                      height: 400,
                                    },
                                    fields: [
                                      ...(Plugin.filename
                                        ? [
                                            {
                                              name: "File Name",
                                              value: Plugin.filename,
                                              inline: false,
                                            },
                                          ]
                                        : []),
                                      ...(Plugin.version
                                        ? [
                                            {
                                              name: "Version",
                                              value: Plugin.version,
                                              inline: false,
                                            },
                                          ]
                                        : []),
                                      ...(Plugin.updateUrl
                                        ? [
                                            {
                                              name: "Download Link",
                                              value: Plugin.updateUrl,
                                              inline: false,
                                            },
                                          ]
                                        : []),
                                      ...(Plugin.source
                                        ? [
                                            {
                                              name: "Source Website",
                                              value: Plugin.source,
                                              inline: false,
                                            },
                                          ]
                                        : []),
                                      ...(Plugin.invite
                                        ? [
                                            {
                                              name: "Support Server",
                                              value: `https://discord.gg/${Plugin.invite}`,
                                              inline: false,
                                            },
                                          ]
                                        : []),
                                    ],
                                  },
                                ])
                              )
                            : MessageActions.receiveMessage(
                                channel.id,
                                FakeMessage.makeMessage(
                                  channel.id,
                                  Plugin.updateUrl ??
                                    "Plugin Don't Have a download Link."
                                )
                              );
                      } catch (err) {
                        Logger.err(err);
                        MessageActions.receiveMessage(
                          channel.id,
                          FakeMessage.makeMessage(
                            channel.id,
                            "Unable to fetch the plugin for info."
                          )
                        );
                      }
                    },
                    options: [
                      {
                        description: "Whether you want to send this or not.",
                        displayDescription:
                          "Whether you want to send this or not.",
                        displayName: "Send",
                        name: "Send",
                        required: true,
                        type: 5,
                      },
                      {
                        description:
                          "Whether you want to send additional info related Plugin.",
                        displayDescription:
                          "Whether you want to send additional info related Plugin.",
                        displayName: "Additional Info",
                        name: "Additional Info",
                        required: true,
                        type: 5,
                      },
                      {
                        description: "Which Plugin you want to share.",
                        displayDescription: "Which Plugin you want to share.",
                        displayName: "Plugin",
                        name: "Plugin",
                        required: true,
                        choices: Plugins.getAll().map(({ name, id }) => ({
                          name,
                          displayName: name,
                          value: id,
                        })),
                        type: 3,
                      },
                    ],
                  });
                if (this.settings["themes"])
                  SlashCommandAPI.register("EZShareThemes", {
                    name: "share theme",
                    displayName: "share theme",
                    displayDescription:
                      "Shares Download link and additional info for the specified Theme.",
                    description:
                      "Shares Download link and additional info for the specified Theme.",
                    type: 1,
                    target: 1,
                    execute: ([send, info, themeID], { channel }) => {
                      try {
                        const Theme = Themes.get(themeID.value);
                        if (send.value) {
                          const ThemeData = fs.readFileSync(path.join(Themes.folder, Theme.filename), 'utf8');
                          const ThemeText = new Blob([ThemeData], { type: "text/plain" });
                          const CSSFileToUpload = new File([ThemeText], Theme.filename);
                          UploadModule.upload({
                            channelId: channel.id,
                            file: CSSFileToUpload,
                            draftType: null,
                            message: "",
                          }); info.value
                          ? MessageActions.sendMessage(
                              channel.id,
                              {
                                content: `**${Plugin.name}** \n ${
                                  Plugin.description
                                } \n\n ${
                                  Plugin.filename
                                    ? `Filename: ${Plugin.filename} \n`
                                    : ""
                                } ${
                                  Plugin.version
                                    ? `Version: ${Plugin.version} \n`
                                    : ""
                                } ${
                                  Plugin.updateUrl
                                    ? `Download Link: ${Plugin.updateUrl} \n`
                                    : ""
                                } ${
                                  Plugin.source
                                    ? `Source Website: ${Plugin.source} \n`
                                    : ""
                                } ${
                                  Plugin.invite
                                    ? `Support server: https://discord.gg/${Plugin.invite}`
                                    : ""
                                }`,
                                tts: false,
                                invalidEmojis: [],
                                validNonShortcutEmojis: [],
                              },
                              undefined,
                              {}
                            )
                          : Plugin.updateUrl
                          ? MessageActions.sendMessage(
                              channel.id,
                              {
                                content: Plugin.updateUrl,
                                tts: false,
                                invalidEmojis: [],
                                validNonShortcutEmojis: [],
                              },
                              undefined,
                              {}
                            )
                          : MessageActions.receiveMessage(
                              channel.id,
                              FakeMessage.makeMessage(
                                channel.id,
                                "Theme Don't Have a download Link."
                              )
                            );
                           } else info.value
                           ? MessageActions.receiveMessage(
                               channel.id,
                               FakeMessage.makeMessage(channel.id, "", [
                                 {
                                   type: "rich",
                                   title: Theme.name,
                                   description: Theme.description,
                                   color: "6577E6",
                                   thumbnail: {
                                     url: "https://tharki-god.github.io/files-random-host/ic_fluent_color_24_filled.png",
                                     proxyURL:
                                       "https://tharki-god.github.io/files-random-host/ic_fluent_color_24_filled.png",
                                     width: 400,
                                     height: 400,
                                   },
                                   fields: [
                                     ...(Theme.filename
                                       ? [
                                           {
                                             name: "File Name",
                                             value: Theme.filename,
                                             inline: false,
                                           },
                                         ]
                                       : []),
                                     ...(Theme.version
                                       ? [
                                           {
                                             name: "Version",
                                             value: Theme.version,
                                             inline: false,
                                           },
                                         ]
                                       : []),
                                     ...(Theme.updateUrl
                                       ? [
                                           {
                                             name: "Download Link",
                                             value: Theme.updateUrl,
                                             inline: false,
                                           },
                                         ]
                                       : []),
                                     ...(Theme.source
                                       ? [
                                           {
                                             name: "Source Website",
                                             value: Theme.source,
                                             inline: false,
                                           },
                                         ]
                                       : []),
                                     ...(Theme.invite
                                       ? [
                                           {
                                             name: "Support Server",
                                             value: `https://discord.gg/${Theme.invite}`,
                                             inline: false,
                                           },
                                         ]
                                       : []),
                                   ],
                                 },
                               ])
                             )
                           : MessageActions.receiveMessage(
                               channel.id,
                               FakeMessage.makeMessage(
                                 channel.id,
                                 Plugin.updateUrl ??
                                   "Plugin Don't Have a download Link."
                               )
                             )
                      } catch (err) {
                        Logger.err(err);
                        MessageActions.receiveMessage(
                          channel.id,
                          FakeMessage.makeMessage(
                            channel.id,
                            "Unable to fetch the theme for info."
                          )
                        );
                      }
                    },
                    options: [
                      {
                        description: "Whether you want to send this or not.",
                        displayDescription:
                          "Whether you want to send this or not.",
                        displayName: "Send",
                        name: "Send",
                        required: true,
                        type: 5,
                      },
                      {
                        description:
                          "Whether you want to send additional info related Plugin.",
                        displayDescription:
                          "Whether you want to send additional info related Plugin.",
                        displayName: "Additional Info",
                        name: "Additional Info",
                        required: true,
                        type: 5,
                      },
                      {
                        description: "Which Theme you want to share.",
                        displayDescription: "Which Theme you want to share.",
                        displayName: "Theme",
                        name: "Theme",
                        required: true,
                        choices: Themes.getAll().map(({ name, id }) => ({
                          name,
                          displayName: name,
                          value: id,
                        })),
                        type: 3,
                      },
                    ],
                  });
            }
            onStop() {
              SlashCommandAPI.unregister("EZSharePlugins");
              SlashCommandAPI.unregister("EZShareThemes");
            }
            getSettingsPanel() {
              return SettingPanel.build(
                this.saveSettings.bind(this),
                new Switch(
                  "Plugins",
                  "Get a slash command for sharing plugins.",
                  this.settings["plugins"],
                  (e) => {
                    this.settings["plugins"] = e;
                  }
                ),
                new Switch(
                  "Themes",
                  "Get a slash command for sharing Themes.",
                  this.settings["themes"],
                  (e) => {
                    this.settings["themes"] = e;
                  }
                )
              );
            }
            saveSettings() {
              Utilities.saveData(config.info.name, "settings", this.settings);
            }
          };
          return plugin(Plugin, Library);
        })(window.ZeresPluginLibrary.buildPlugin(config));
  })();
  /*@end@*/
  