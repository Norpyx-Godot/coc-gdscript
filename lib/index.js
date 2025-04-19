"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  activate: () => activate
});
module.exports = __toCommonJS(index_exports);
var net = __toESM(require("net"));
var import_path = require("path");
var import_fs = require("fs");
var import_coc = require("coc.nvim");
async function activate(context) {
  const config = import_coc.workspace.getConfiguration("godot");
  if (config.get("enable") === false || config.get("enabled") === false) {
    return;
  }
  const existing = import_coc.services.getService("godot");
  if (existing) {
    import_coc.window.showWarningMessage(
      "Godot LSP is already configured (likely in coc-settings). Please remove that configuration to use the coc-godot4 extension."
    );
    return;
  }
  const host = config.get("host", "127.0.0.1");
  const port = config.get("port", 6005);
  let client = null;
  function startGodotLanguageClient() {
    const serverOptions = () => new Promise((resolve, reject) => {
      const socket = net.connect(port, host, () => {
        resolve({ reader: socket, writer: socket });
      });
      socket.on("error", (err) => {
        reject(err);
      });
    });
    const clientOptions = {
      documentSelector: [
        { scheme: "file", language: "gdscript" },
        { scheme: "file", language: "gdshader" }
      ],
      // Optionally, we could include workspaceFolder if needed. Coc will usually handle root detection via rootPatterns.
      synchronize: {}
      // (no specific file sync needed for this simple integration)
    };
    const languageClient = new import_coc.LanguageClient(
      "godot",
      // id (used internally by Coc.nvim)
      "Godot Language Server",
      // name (for logs or messages)
      serverOptions,
      clientOptions
    );
    languageClient.onDidChangeState((e) => {
      if (e.newState === import_coc.State.Stopped) {
        client = null;
        setTimeout(() => {
          if (!client) {
            startGodotLanguageClient();
          }
        }, 3e3);
      }
    });
    client = languageClient;
    context.subscriptions.push(import_coc.services.registerLanguageClient(languageClient));
    languageClient.onReady().catch((_err) => {
      languageClient.outputChannel.appendLine("Godot LSP connection failed, will retry...");
      try {
        languageClient.stop();
      } catch (_) {
      }
      client = null;
      setTimeout(() => {
        if (!client) {
          startGodotLanguageClient();
        }
      }, 3e3);
    });
  }
  let shouldStart = false;
  if (import_coc.workspace.workspaceFolders && import_coc.workspace.workspaceFolders.length) {
    for (const folder of import_coc.workspace.workspaceFolders) {
      const folderPath = import_coc.Uri.parse(folder.uri).fsPath || folder.uri;
      if ((0, import_fs.existsSync)((0, import_path.join)(folderPath, "project.godot")) || (0, import_fs.existsSync)((0, import_path.join)(folderPath, ".godot"))) {
        shouldStart = true;
        break;
      }
    }
  }
  for (const doc of import_coc.workspace.textDocuments) {
    const lang = doc.languageId;
    if (lang === "gdscript" || lang === "gdshader") {
      shouldStart = true;
      break;
    }
  }
  if (shouldStart) {
    startGodotLanguageClient();
  }
  const openWatcher = import_coc.workspace.onDidOpenTextDocument((document) => {
    const lang = document.languageId;
    if (!client && (lang === "gdscript" || lang === "gdshader")) {
      startGodotLanguageClient();
    }
  });
  context.subscriptions.push(openWatcher);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate
});
