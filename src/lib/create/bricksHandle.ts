import { BrickData } from "@/types/create";

interface BrickState {
    bricks:BrickData[]
}

export class Bricks {

    private state: BrickState;

    constructor(private updateStates:()=>void,defaultsBricks?:BrickData[]) {
        this.state = {
            bricks:defaultsBricks?defaultsBricks:[],
        }
    }

    public moveBrick = (id: number, x: number, y: number) => {
        console.log('bricks éditée A')
        this.state.bricks = this.state.bricks.map((brick) =>
            brick.id === id ? { ...brick, x, y } : brick
        )
        this.updateStates()
    };
    
    public insertBrickToContainer = (brickId: number, targetBrick: BrickData,holeIndex:number) => {
    
        const tmpBrick:BrickData[] = JSON.parse(JSON.stringify(this.state.bricks))
        
        const movedBrick = tmpBrick.find((brick) => brick.id === brickId);
        const holes = targetBrick?.content
    
        
        if(!holes) return alert('mhmhmh')
        
        const holeData = holes[holeIndex]
        
        if(holeData.type!=='drop') return
        
        if(!movedBrick||!targetBrick||!holeData) return alert('mhmh')
        
        if(!holeData.accept.includes(movedBrick.type)) return
        
        const updatedtmpBrick = tmpBrick.map((brick) => {
          
    
          if (brick.id === targetBrick.id) {
    
            if(!brick.content) return
            let hole = brick.content[holeIndex]
            if(hole.type!=="drop") return
            let holeChild = hole.child
            let newChild:number[] = [movedBrick.id]
            if(holeChild.length>0&&holeData.acceptMany){
              newChild = JSON.parse(JSON.stringify(holeChild))
              newChild.push(movedBrick.id)
            }
    
            brick.content[holeIndex] = {
              id:hole.id,
              type:'drop',
              // value:movedBrick,
              child:newChild,
              accept:hole.accept,
              acceptMany:holeData.acceptMany,
            }
    
            return {
              ...brick
            };
    
    
          }
          if (brick.id === brickId) {
            // return brick
            return {
              ...brick,
              parent:targetBrick.id,
              parenthole:holeIndex,
            }
            // return null;
          }
          if(holeData.child.includes(brick.id)){
            // let lenght = holeData.child.length
            if(!holeData.acceptMany){
              let newBrick = {...brick}
              newBrick.parent=null
              newBrick.parenthole=null
              return newBrick
            }
          }
          return brick;
        }).filter((brick) => brick !== null);
    
        if (JSON.stringify(this.state.bricks) !== JSON.stringify(updatedtmpBrick)) {
          this.state.bricks = updatedtmpBrick
          this.updateStates()
        }
    
      };

    public getBricks = () => {return this.state.bricks}

}