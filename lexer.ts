// https://github.com/NoSweatProgramming/domLang/blob/main/lexer.ts
// -----------------------------------------------------------
// ---------------          LEXER          -------------------
// ---  Responsible for producing tokens from the source   ---
// -----------------------------------------------------------

// Represents tokens that the language understands in parsing.
export enum TokenType {
	// Literal Types
	Number,
	Identifier,

	// Keywords
	Let,
	Const,
	Fn, // FN

	// Grouping * Operators
	BinaryOperator,  // Examples: +, -, *, /.
	Equals, // =
	Comma, // ,
	Dot, // .
	Colon, // :
	Semicolon, // ;
	OpenParen, // (
	CloseParen, // )
	OpenBrace, // {
	CloseBrace, // }
	OpenBracket, // [
	CloseBracket, //]
	EOF, // Signified the end of file.
}

// Constant lookup for keywords and known identifiers + symbols.
const KEYWORDS: Record<string, TokenType> = {
	let: TokenType.Let,
	const: TokenType.Const,
	fn: TokenType.Fn,
};

// Reorents a single token from the source-code.
export interface Token {
	value: string; // Contains the raw value as seen inside the source code.
	type: TokenType; // Tagged structure.
}

// Returns a token of a given type and value
function token(value = "", type: TokenType): Token {
	return { value, type };
}

// Returns whether the character passed in alphabetic -> [a-zA-Z]
function isalpha(src: string) {
	return src.toUpperCase() != src.toLowerCase();
}

// Returns true if the character is whitespace like -> [\s, \t, \n]
function isskippable(str: string) {
	return str == " " || str == "\n" || str == "\t" || str == "\r";
}

// Returns true if the character is whitespace like -> [\s, \t, \n]
function isint(str: string) {
	const c = str.charCodeAt(0);
	const bounds = ["0".charCodeAt(0), "9".charCodeAt(0)];
	return c >= bounds[0] && c <= bounds[1];
}

/**
 * Given a string representing source code: Produce tokens and handles
 * possible unidentified characters.
 *
 * - Returns a array of tokens.
 * - Does not modify the incoming string.
 */
export function tokenize(sourceCode: string): Token[] {
	const tokens = new Array<Token>();
	const src = sourceCode.split("");

	// Produce tokens until the EOF is reached.
	while (src.length > 0) {
		// Begin parsing 1 character tokens.
		if (src[0] == "(") {
			tokens.push(token(src.shift(), TokenType.OpenParen));
		} else if (src[0] == ")") {
			tokens.push(token(src.shift(), TokenType.CloseParen));
		} else if (src[0] == "{") {
			tokens.push(token(src.shift(), TokenType.OpenBrace));
		} else if (src[0] == "}") {
			tokens.push(token(src.shift(), TokenType.CloseBrace));
		} else if (src[0] == "[") {
			tokens.push(token(src.shift(), TokenType.OpenBracket));
		} else if (src[0] == "]") {
			tokens.push(token(src.shift(), TokenType.CloseBracket));
		} else if (		// Handle binary operators.
			src[0] == "+" ||
			src[0] == "-" ||
			src[0] == "*" ||
			src[0] == "/" ||
			src[0] == "%"
		) {
			tokens.push(token(src.shift(), TokenType.BinaryOperator));
		} // Handle Conditional & Assignment Tokens.
		else if (src[0] == "=") {
			tokens.push(token(src.shift(), TokenType.Equals));
		} else if (src[0] == ";") {
			tokens.push(token(src.shift(), TokenType.Semicolon));
		} else if (src[0] == ":") {
			tokens.push(token(src.shift(), TokenType.Colon));
		} else if (src[0] == ",") {
			tokens.push(token(src.shift(), TokenType.Comma));
		} else if (src[0] == ".") {
			tokens.push(token(src.shift(), TokenType.Dot));
		} // Handle multicharacter keywords, tokens, identifiers, ETC...
		else {
			// Handle numeric literals -> Integers
			if (isint(src[0])) {
				let num = "";
				while (src.length > 0 && isint(src[0])) {
					num += src.shift();
				}

				// Append new numeric token.
				tokens.push(token(num, TokenType.Number));
			} // Handle Identifier & Keyword Tokens.
			else if (isalpha(src[0])) {
				let ident = "";
				while (src.length > 0 && isalpha(src[0])) {
					ident += src.shift();
				}

				// Check for reserved keywords.
				const reserved = KEYWORDS[ident];
				// If value is not undefined then the identifier is reconized keyword.
				if (typeof reserved == "number") {
					tokens.push(token(ident, reserved));
				} else {
					// Unreconized name must mean user defined symbol.
					tokens.push(token(ident, TokenType.Identifier));
				}
			} else if (isskippable(src[0])) {
				// Skip uneeded chars.
				src.shift();
			} // Handle unreconized characters.
			else {
				console.error("Unreconized character found in source: ", src[0].charCodeAt(0), src[0]);
				Deno.exit(1);
			}
		}
	}

	tokens.push({ type: TokenType.EOF, value: "EndOfFile" });
	return tokens;
}
