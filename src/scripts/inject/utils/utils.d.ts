
type DOMQueryResultInstance = {
	name: (name: string) => DOMQueryResultInstance;
	/**
	 * expect(eq: number) OR
	 * expect(egt: number, lt: number)
	 */
	expect: (num1: number, num2?: number) => DOMQueryResultInstance;
	get: (offset?: number) => Element;
};
