import { ButtonStyle, ButtonBuilder, type ComponentEmojiResolvable } from 'discord.js';

type ButtonOptions = [
	customId: string,
	label?: string,
	emoji?: ComponentEmojiResolvable,
	disabled?: boolean,
];

type LinkButtonOptions = [label: string, uri: string];

export class ExtendedButtonBuilder extends ButtonBuilder {
	private makeButton(style: ButtonStyle, ...args: ButtonOptions | LinkButtonOptions) {
		if (style === 5) {
			const [label, uri] = args as LinkButtonOptions;
			return this.setStyle(style).setLabel(label).setURL(uri);
		}

		const [customId, label, emoji, disabled] = args as ButtonOptions;
		if (!(label || emoji)) {
			throw new Error('Button must have a label or an emoji.');
		}
		if (label) this.setLabel(label);
		if (emoji) this.setEmoji(emoji);
		return this.setStyle(style)
			.setCustomId(customId)
			.setDisabled(disabled || false);
	}

	link = (...args: LinkButtonOptions) => this.makeButton(ButtonStyle.Link, ...args);
	danger = (...args: ButtonOptions) => this.makeButton(ButtonStyle.Danger, ...args);
	success = (...args: ButtonOptions) => this.makeButton(ButtonStyle.Success, ...args);
	primary = (...args: ButtonOptions) => this.makeButton(ButtonStyle.Primary, ...args);
	secondary = (...args: ButtonOptions) => this.makeButton(ButtonStyle.Secondary, ...args);
}
