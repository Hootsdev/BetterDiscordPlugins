/**
 * @name Lister
 * @author Ahlawat
 * @authorId 1025214794766221384
 * @version 1.0.4
 * @invite SgKSKyh9gY
 * @website https://tharki-god.github.io/
 * @description Adds a slash command to send a list of enabled and disabled plugins/themes.
 * @updateUrl https://raw.githubusercontent.com/Tharki-God/BetterDiscordPlugins/master/Lister.plugin.js
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
      name: "Lister",
      authors: [
        {
          name: "Ahlawat",
          discord_id: "1025214794766221384",
          github_username: "Tharki-God",
        },
      ],
      version: "1.0.4",
      description:
        "Adds a slash command to send a list of enabled and disabled plugins/themes.",
      github: "https://github.com/Tharki-God/BetterDiscordPlugins",
      github_raw:
        "https://raw.githubusercontent.com/Tharki-God/BetterDiscordPlugins/master/Lister.plugin.js",
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
          "This is the initial release of the plugin.",
          "This should be built into better discord.",
        ],
      },
      {
        title: "v1.0.1",
        items: ["Corrected text."],
      }
    ],
    main: "Lister.plugin.js",
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
      start() { }
      stop() { }
    }
    : (([Plugin, Library]) => {
      const {
        WebpackModules,
        PluginUpdater,
        Logger,
        Patcher,
        DiscordModules: { MessageActions },
      } = Library;
      const { Themes } = BdApi;
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
      const ApplicationCommandAPI = new class {
        constructor() {
          this.version = "1.0.0";
          this.ApplicationCommandStore = WebpackModules.getModule((m) =>
            m?.ZP?.getApplicationSections
          );
          this.IconUtils = WebpackModules.getByProps("getApplicationIconURL");
          this.UserStore = WebpackModules.getByProps(
            "getCurrentUser",
            "getUser"
          );
          this.CurrentUser = this.UserStore.getCurrentUser();
          this.CurrentUserSection = {
            id: this.CurrentUser.id,
            name: this.CurrentUser.username,
            type: 1,
            icon: this.CurrentUser.avatar,
          }
          this.commands = window?.SlashCommandAPI?.commands ?? new Map();
          Patcher.after(this.ApplicationCommandStore, "JK", (_, args, res) => {
            if (!res || !this.commands.size) return;
            if (
              !Array.isArray(res.sectionDescriptors) ||
              !res.sectionDescriptors.some(
                (section) => section.id == this.CurrentUserSection.id
              )
            )
              res.sectionDescriptors = Array.isArray(res.sectionDescriptors)
                ? res.sectionDescriptors.splice(1, 0, this.CurrentUserSection)
                : [this.CurrentUserSection];
            if (
              !Array.isArray(res.commands) ||
              Array.from(this.commands.values()).some(
                (command) => !res.commands.includes(command)
              )
            )
              res.commands = Array.isArray(res.commands)
                ? [
                  ...res.commands.filter(
                    (command) =>
                      !Array.from(this.commands.values()).includes(command)
                  ),
                  ...Array.from(this.commands.values()),
                ]
                : Array.from(this.commands.values());
          });
          Patcher.after(
            this.ApplicationCommandStore.ZP,
            "getChannelState",
            (_, args, res) => {
              if (!res || !this.commands.size) return;
              if (
                !Array.isArray(res.applicationSections) ||
                !res.applicationSections.some(
                  (section) => section.id == this.CurrentUserSection.id
                )
              )
                res.applicationSections = Array.isArray(res.applicationSections)
                  ? [this.CurrentUserSection, ...res.applicationSections]
                  : [this.CurrentUserSection];
              if (
                !Array.isArray(res.applicationCommands) ||
                Array.from(this.commands.values()).some(
                  (command) => !res.applicationCommands.includes(command)
                )
              )
                res.applicationCommands = Array.isArray(res.applicationCommands)
                  ? [
                    ...res.applicationCommands.filter(
                      (command) =>
                        !Array.from(this.commands.values()).includes(command)
                    ),
                    ...Array.from(this.commands.values()),
                  ]
                  : Array.from(this.commands.values());
            }
          );
          Patcher.instead(
            this.IconUtils,
            "getApplicationIconURL",
            (_, args, res) => {
              if (args[0].id == this.CurrentUser.id)
                return IconUtils.getUserAvatarURL(this.CurrentUser);
              return res(...args);
            }
          );
        }
        register(name, command) {
          (command.applicationId = this.CurrentUser.id),
            (command.id = `${this.CurrentUser.username}_${this.commands.size + 1
              }`.toLowerCase());
          this.commands.set(name, command);
          this.ApplicationCommandStore.ZP.shouldResetAll = true;
        };
        unregister(name) {
          this.commands.delete(name);
          this.pplicationCommandStore.ZP.shouldResetAll = true;
        }
        shouldUpdate(currentApiVersion = window?.SlashCommandAPI?.version, pluginApiVersion = this.version) {
          if (!currentApiVersion) return true;
          else if (!pluginApiVersion) return false;
          currentApiVersion = currentApiVersion.split(".").map((e) => parseInt(e));
          pluginApiVersion = pluginApiVersion.split(".").map((e) => parseInt(e));
          if ((pluginApiVersion[0] > currentApiVersion[0]) || (pluginApiVersion[0] == currentApiVersion[0] && pluginApiVersion[1] > currentApiVersion[1]) || (pluginApiVersion[0] == currentApiVersion[0] && pluginApiVersion[1] == currentApiVersion[1] && pluginApiVersion[2] > currentApiVersion[2])) return true;
          return false;
        }
      }
      const SlashCommandAPI = ApplicationCommandAPI.shouldUpdate() ? window.SlashCommandAPI = ApplicationCommandAPI : window.SlashCommandAPI;
      return class Lister extends Plugin {
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
          SlashCommandAPI.register(`${config.info.name}_themes`, {
            name: "list themes",
            displayName: "list themes",
            displayDescription: "Send a list of all the themes you have.",
            description: "Send a list of all the themes you have.",
            type: 1,
            target: 1,
            execute: ([send, versions, listChoice], { channel }) => {
              try {
                const content = this.getThemes(
                  versions.value,
                  listChoice.value
                );
                send.value
                  ? MessageActions.sendMessage(
                    channel.id,
                    {
                      content,
                      tts: false,
                      invalidEmojis: [],
                      validNonShortcutEmojis: [],
                    },
                    undefined,
                    {}
                  )
                  : MessageActions.receiveMessage(
                    channel.id,
                    FakeMessage.makeMessage(channel.id, content)
                  );
              } catch (err) {
                Logger.err(err);
                MessageActions.receiveMessage(
                  channel.id,
                  FakeMessage.makeMessage(
                    channel.id,
                    "Unable to list your themes."
                  )
                );
              }
            },
            options: [
              {
                description: "Whether you want to send this or not.",
                displayDescription: "Whether you want to send this or not.",
                displayName: "Send",
                name: "Send",
                required: true,
                type: 5,
              },
              {
                description: "Whether you want to add version info.",
                displayDescription: "Whether you want to add version info.",
                displayName: "Versions",
                name: "Versions",
                required: true,
                type: 5,
              },
              {
                description:
                  "Whether you want to send either only enabled, disabled or all themes.",
                displayDescription:
                  "Whether you want to send either only enabled, disabled or all themes.",
                displayName: "List",
                name: "List",
                required: true,
                choices: [
                  {
                    name: "Enabled",
                    displayName: "Enabled",
                    value: "enabled",
                  },
                  {
                    name: "Disabled",
                    displayName: "Disabled",
                    value: "disabled",
                  },
                  {
                    name: "Both",
                    displayName: "Both",
                    value: "default",
                  },
                ],
                type: 3,
              },
            ],
          });

          SlashCommandAPI.register(`${config.info.name}_plugins`, {
            name: "list plugins",
            displayName: "list plugins",
            displayDescription: "Send a list of all the plugins you have.",
            description: "Send a list of all the plugins you have.",
            type: 1,
            target: 1,
            execute: ([send, versions, listChoice], { channel }) => {
              try {
                const content = this.getPlugins(
                  versions.value,
                  listChoice.value
                );
                send.value
                  ? MessageActions.sendMessage(
                    channel.id,
                    {
                      content,
                      tts: false,
                      invalidEmojis: [],
                      validNonShortcutEmojis: [],
                    },
                    undefined,
                    {}
                  )
                  : MessageActions.receiveMessage(
                    channel.id,
                    FakeMessage.makeMessage(channel.id, content)
                  );
              } catch (err) {
                Logger.err(err);
                MessageActions.receiveMessage(
                  channel.id,
                  FakeMessage.makeMessage(channel.id, "Unable to list your plugins.")
                );
              }
            },
            options: [
              {
                description: "Whether you want to send this or not.",
                displayDescription: "Whether you want to send this or not.",
                displayName: "Send",
                name: "Send",
                required: true,
                type: 5,
              },
              {
                description: "Whether you want to add version info.",
                displayDescription: "Whether you want to add version info.",
                displayName: "Versions",
                name: "Versions",
                required: true,
                type: 5,
              },
              {
                description:
                  "Whether you want to send either only enabled, disabled or all plugins.",
                displayDescription:
                  "Whether you want to send either only enabled, disabled or all plugins.",
                displayName: "List",
                name: "List",
                required: true,
                choices: [
                  {
                    name: "Enabled",
                    displayName: "Enabled",
                    value: "enabled",
                  },
                  {
                    name: "Disabled",
                    displayName: "Disabled",
                    value: "disabled",
                  },
                  {
                    name: "Both",
                    displayName: "Both",
                    value: "default",
                  },
                ],
                type: 3,
              },
            ],
          });
        }
        getThemes(version, list) {
          const allThemes = Themes.getAll();
          const enabled = allThemes.filter((t) => Themes.isEnabled(t.id));
          const disabled = allThemes.filter((t) => !Themes.isEnabled(t.id));
          const enabledMap = enabled
            .map((t) => (version ? `${t.name} (${t.version})` : t.name))
            .join(", ");
          const disabledMap = disabled
            .map((t) => (version ? `${t.name} (${t.version})` : t.name))
            .join(", ");
          switch (list) {
            case "enabled":
              return `**Enabled Themes (${enabled.length}):** \n ${enabledMap}`;
              break;
            case "disabled":
              return `**Disabled Themes (${disabled.length}):** \n ${disabledMap}`;
              break;
            default:
              return `**Enabled Themes (${enabled.length}):** \n ${enabledMap} \n\n **Disabled Themes (${disabled.length}):** \n ${disabledMap}`;
          }
        }
        getPlugins(version, list) {
          const allPlugins = Plugins.getAll();
          const enabled = allPlugins.filter((p) => Plugins.isEnabled(p.id));
          const disabled = allPlugins.filter((p) => !Plugins.isEnabled(p.id));
          const enabledMap = enabled
            .map((p) => (version ? `${p.name} (${p.version})` : p.name))
            .join(", ");
          const disabledMap = disabled
            .map((p) => (version ? `${p.name} (${p.version})` : p.name))
            .join(", ");
          switch (list) {
            case "enabled":
              return `**Enabled Plugins (${enabled.length}):** \n ${enabledMap}`;
              break;
            case "disabled":
              return `**Disabled Plugins (${disabled.length}):** \n ${disabledMap}`;
              break;
            default:
              return `**Enabled Plugins (${enabled.length}):** \n ${enabledMap} \n\n **Disabled Plugins (${disabled.length}):** \n ${disabledMap}`;
          }
        }
        onStop() {
          SlashCommandAPI.unregister(`${config.info.name}_themes`);
          SlashCommandAPI.unregister(`${config.info.name}_plugins`);
        }
      };
      return plugin(Plugin, Library);
    })(window.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
