export const journalPageSize = 3;
export const journalTypes = [
 {id:'project',label:'项目复盘',english:'Project notes',icon:'code',description:'从具体问题出发，记录方案、实现、取舍与下一步。',summaryTitle:'这次复盘的重点'},
 {id:'learning',label:'学习笔记',english:'Learning notes',icon:'book',description:'把新理解写清楚，也留下步骤、例子与实践线索。',summaryTitle:'先记住这几点'},
 {id:'knowledge',label:'知识归档',english:'Knowledge library',icon:'layers',description:'整理可以反复查阅的概念、方法、资料与出处。',summaryTitle:'快速查阅'},
 {id:'essay',label:'随想心得',english:'Engineering reflections',icon:'leaf',description:'从协作、评审与写作中，提炼可以反复使用的工程判断。',summaryTitle:'这篇思考的落点'},
] as const;
export type JournalType = typeof journalTypes[number]['id'];
export function resolveJournalType(data:{type?:JournalType;category:string}):JournalType {
 if(data.type)return data.type;
 if(/复盘|项目/.test(data.category))return 'project';
 if(/知识|归档|资料/.test(data.category))return 'knowledge';
 if(/学习|笔记|教程/.test(data.category))return 'learning';
 return 'essay';
}
export function journalType(data:{type?:JournalType;category:string}){
 return journalTypes.find(item=>item.id===resolveJournalType(data))!;
}
export const journalDate=(date:Date)=>date.toISOString().slice(0,10).replaceAll('-','.');
export function journalTagTone(tag:string){
 const value=Array.from(tag).reduce((sum,char)=>sum+char.codePointAt(0)!,0);
 return ['rose','sage','blue','amber'][value%4];
}
