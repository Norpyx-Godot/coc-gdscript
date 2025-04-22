# coc-gdscript

**GDScript LSP integration for coc.nvim**

This extension provides out-of-the-box integration between the Godot 4 editor’s
built-in Language Server and Vim/Neovim via
[coc.nvim](https://github.com/neoclide/coc.nvim). Enjoy IDE‑like features for
GDScript and Godot shader files directly in your editor.

![screenshot](https://raw.githubusercontent.com/Norpyx-Godot/coc-gdscript/main/lib/example.png)

---

## 📦 Install

```vim
:CocInstall coc-gdscript
```

> [!TIP]
>
> For **Syntax Highlighting**, use a dedicated plugin like
> [habamax/vim-godot](https://github.om/habamax/vim-godot)
>
> ```vim
> Plug 'habamax/vim-godot'
> ```

## 🚀 Features

- **Automatic LSP Connection**: Connects to Godot 4’s LSP server over TCP
 (`127.0.0.1:6005`) whenever you open a GDScript (`.gd`) or Godot shader
 (`.gdshader`) file, or when a Godot project (via `project.godot` or `.godot/`)
 is detected in your workspace.
- **Code Completion**: Context‑aware autocompletion for GDScript methods,
 properties, and constants.
- **Diagnostics**: Real‑time syntax and semantic error reporting as you type.
- **Hover**: View documentation and type information on hover.
- **Go‑to Definition**: Jump to symbol definitions within your project.
- **Signature Help**: Parameter hints while writing function calls.
- **Automatic Reconnection**: If the Godot editor (and its LSP server) restarts,
the extension will automatically attempt to reconnect without restarting
Vim/Neovim.

## ⚙️ Configuration

All settings live under the `godot` namespace in your `coc-settings.json`:

```json
{
  "godot.enable": true,
  "godot.host": "127.0.0.1",
  "godot.port": 6005
}
```

| Setting         | Type    | Default     | Description                                                          |
| --------------- | ------- | ----------- | -------------------------------------------------------------------- |
| `godot.enable`  | boolean | `true`      | Globally enable or disable the Godot LSP integration.                |
| `godot.host`    | string  | `127.0.0.1` | TCP host where Godot’s LSP server listens (usually localhost).       |
| `godot.port`    | number  | `6005`      | TCP port for Godot’s LSP server (default port 6005).                 |

## 📝 Usage

1. Open your Godot 4 project in Vim/Neovim. Make sure the Godot editor is
 running with your project loaded—this starts the LSP server on port `6005`.
2. Open any `.gd` or `.gdshader` file. Coc.nvim will detect the filetype and/or
 the presence of a Godot project and automatically connect to the LSP.
3. Enjoy IDE‑like features: code completion, diagnostics, hover, go‑to
 definition, and more.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to:

1. Fork the repository
2. Create a branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a pull request

Please ensure code is formatted and tested before submitting.

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE)
file for details.

---

> This extension is built with [create-coc-extension](https://github.com/fannheyward/create-coc-extension)

