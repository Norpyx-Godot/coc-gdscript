import * as net from 'net';
import { join } from 'path';
import { existsSync } from 'fs';

import {
	ExtensionContext,
	workspace,
	window,
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	State,
	services,
	Uri
} from 'coc.nvim';

export async function activate(context: ExtensionContext): Promise<void> {
	const config = workspace.getConfiguration('godot');
	if (config.get<boolean>('enable') === false || config.get<boolean>('enabled') === false) {
		// If disabled via config (`godot.enable`), do nothing
		return;
	}

	// Prevent conflict if Godot LSP is configured manually in coc-settings.json
	const existing = services.getService('godot');
	if (existing) {
		window.showWarningMessage(
			"Godot LSP is already configured (likely in coc-settings). Please remove that configuration to use the coc-godot4 extension."
		);
		return;
	}

	const host: string = config.get<string>('host', '127.0.0.1');
	const port: number = config.get<number>('port', 6005);

	let client: LanguageClient | null = null;

	// Function to create and start the Language Client
	function startGodotLanguageClient() {
		// Define server connection to Godot's LSP over TCP
		const serverOptions: ServerOptions = () => new Promise((resolve, reject) => {
			const socket = net.connect(port, host, () => {
				resolve({ reader: socket, writer: socket });
			});
			socket.on('error', (err) => {
				reject(err);
			});
		});

		// Define client options: which files trigger the LS and other settings
		const clientOptions: LanguageClientOptions = {
			documentSelector: [
				{ scheme: 'file', language: 'gdscript' },
				{ scheme: 'file', language: 'gdshader' }
			],
			// Optionally, we could include workspaceFolder if needed. Coc will usually handle root detection via rootPatterns.
			synchronize: {}	// (no specific file sync needed for this simple integration)
		};

		// Create the LanguageClient instance for Godot LSP
		const languageClient = new LanguageClient(
			'godot',									// id (used internally by Coc.nvim)
			'Godot Language Server',	// name (for logs or messages)
			serverOptions,
			clientOptions
		);

		// Listen for state changes to handle reconnection if needed
		languageClient.onDidChangeState((e) => {
			if (e.newState === State.Stopped) {
				// If the client stops (e.g. connection lost), attempt to reconnect after a delay
				client = null;
				setTimeout(() => {
					// Only reconnect if not already connected or connecting
					if (!client) {
						startGodotLanguageClient();
					}
				}, 3000);
			}
		});

		// Register and start the language client
		client = languageClient;
		context.subscriptions.push(services.registerLanguageClient(languageClient));

		// Handle the case where the server might not be up yet:
		languageClient.onReady().catch((_err) => {
			// onReady rejection implies connection/init failed
			languageClient.outputChannel.appendLine("Godot LSP connection failed, will retry...");
			// Dispose current failed client to clean up
			try {
				languageClient.stop();
			} catch (_) { /* ignore stop errors */ }
			client = null;
			// Schedule a reconnect attempt
			setTimeout(() => {
				if (!client) {
					startGodotLanguageClient();
				}
			}, 3000);
		});
	}

	// Determine if we should start the client immediately
	let shouldStart = false;
	// Check workspace folders for a Godot project file
	if (workspace.workspaceFolders && workspace.workspaceFolders.length) {
		for (const folder of workspace.workspaceFolders) {
			const folderPath = Uri.parse(folder.uri).fsPath || folder.uri;	// get file system path
			if (existsSync(join(folderPath, 'project.godot')) || existsSync(join(folderPath, '.godot'))) {
				shouldStart = true;
				break;
			}
		}
	}
	// Also check currently open documents for Godot file types
	for (const doc of workspace.textDocuments) {
		const lang = doc.languageId;
		if (lang === 'gdscript' || lang === 'gdshader') {
			shouldStart = true;
			break;
		}
	}

	if (shouldStart) {
		startGodotLanguageClient();
	}

	// Even if not started now, listen for future file opens to trigger the LS
	const openWatcher = workspace.onDidOpenTextDocument(document => {
		const lang = document.languageId;
		if (!client && (lang === 'gdscript' || lang === 'gdshader')) {
			startGodotLanguageClient();
		}
	});
	context.subscriptions.push(openWatcher);
}



/*

//import type { LanaugeClientOptions } from 'coc.nvim';
//import { ExtensionContext, window, services, workspace, LanguageClient } from 'coc.nvim';
import { ExtensionContext } from 'coc.nvim';

export async function activate(_context: ExtensionContext): Promise<void> {
	//
}

/*
import { commands, CompleteResult, ExtensionContext, listManager, sources, window, workspace } from 'coc.nvim';
import DemoList from './lists';

export async function activate(context: ExtensionContext): Promise<void> {
	window.showInformationMessage('coc-gdscript works!');

	context.subscriptions.push(
		commands.registerCommand('coc-gdscript.Command', async () => {
			window.showInformationMessage('coc-gdscript Commands works!');
		}),

		listManager.registerList(new DemoList()),

		sources.createSource({
			name: 'coc-gdscript completion source', // unique id
			doComplete: async () => {
				const items = await getCompletionItems();
				return items;
			},
		}),

		workspace.registerKeymap(
			['n'],
			'gdscript-keymap',
			async () => {
				window.showInformationMessage('registerKeymap');
			},
			{ sync: false }
		),

		workspace.registerAutocmd({
			event: 'InsertLeave',
			request: true,
			callback: () => {
				window.showInformationMessage('registerAutocmd on InsertLeave');
			},
		})
	);
}

async function getCompletionItems(): Promise<CompleteResult> {
	return {
		items: [
			{
				word: 'TestCompletionItem 1',
				menu: '[coc-gdscript]',
			},
			{
				word: 'TestCompletionItem 2',
				menu: '[coc-gdscript]',
			},
		],
	};
}
*/
