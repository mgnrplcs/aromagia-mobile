/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./components/**/*.{js,ts,jsx,tsx}",
        "./app/**/*.{js,ts,jsx,tsx}",
        "./screens/**/*.{js,ts,jsx,tsx}",
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            fontFamily: {
                inter: ["Inter-Regular"],
                "inter-light": ["Inter-Light"],
                "inter-medium": ["Inter-Medium"],
                "inter-semibold": ["Inter-SemiBold"],
                "inter-bold": ["Inter-Bold"],
                
                raleway: ["Raleway-Regular"],
                "raleway-light": ["Raleway-Light"],
                "raleway-medium": ["Raleway-Medium"],
                "raleway-semibold": ["Raleway-SemiBold"],
                "raleway-bold": ["Raleway-Bold"],
            },
        },
    },
    plugins: [],
};