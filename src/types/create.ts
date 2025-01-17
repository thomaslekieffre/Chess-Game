export type dropFieldType = {
  type:'drop';
  accept:string[];
  // value:null|BrickData;
  child:number[];
  id:number;
  acceptMany:boolean;
} 

export type numberFieldType = {
  type:'number';
  value:number;
  id:number;
}

export type inputFieldType = {
  type:'input';
  value:string;
  id:number;
}

export type customSelectFieldType = {
  type:'select';
  value:any[];
  id:number;
}

export type textFieldType = {
  type:'text';
  value:string;
  id:number;
}
export type fieldType = dropFieldType|numberFieldType|inputFieldType|customSelectFieldType|textFieldType
// export type fieldType = dropFieldType 

export type BrickData = {
  id: number;
  x: number;
  y: number;
  color: string;
  // content: string;
  type:string;
  content:fieldType[];
  parent:number|null;
  parenthole:number|null
}

export interface DragItem {
  id: number;
  type: string;
}