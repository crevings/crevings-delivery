const fs = require('fs');
let content = fs.readFileSync('components/MenuView.tsx', 'utf8');

const oldType = "{id: string, name: string, isActive: boolean, addons: {id: string, name: string, price: string}[]}";
const newType = "{id: string, name: string, type?: 'addon' | 'topping', isRequired?: boolean, isActive: boolean, addons: {id: string, name: string, price: string}[]}";

content = content.split(oldType).join(newType);

fs.writeFileSync('components/MenuView.tsx', content);
