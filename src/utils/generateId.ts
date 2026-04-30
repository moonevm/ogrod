export function generateId({ prefix, separator = "-", amount = 16 }: { prefix: string, separator?: String, amount?: number }) {
    const characters = "qwertzuiopasdfghjklyxcvbnmQWERTZUIOPASDFGHJKLYXCVBNM"
    let result = ""

    for (let i = 0; i < amount; i++) {
        result += characters[Math.floor(Math.random() * characters.length)]
    }

    return prefix + separator + result
}