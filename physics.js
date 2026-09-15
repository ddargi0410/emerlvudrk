export const DIFFICULTIES={easy:{name:'급식실',label:'쉬움',gap:1.25,ghostSpeed:3.35,code:'123',window:1.1},normal:{name:'본관',label:'보통',gap:1.65,ghostSpeed:4.05,code:'314',window:.86},hard:{name:'신관',label:'어려움',gap:1.95,ghostSpeed:4.65,code:'241',window:.68}};
export function supports(platform,x,z,margin=0){return x>=platform.x-platform.w/2-margin&&x<=platform.x+platform.w/2+margin&&z>=platform.z-platform.d/2-margin&&z<=platform.z+platform.d/2+margin;}
export function groundAt(platforms,x,z,ceiling=Infinity){let top=-Infinity;for(const p of platforms)if(supports(p,x,z)&&p.y<=ceiling&&p.y>top)top=p.y;return top;}
export function blocked(colliders,x,z,y,r=.27){return colliders.some(b=>y+1.6>b.y-b.h/2+.04&&y<b.y+b.h/2-.06&&x+r>b.x-b.w/2&&x-r<b.x+b.w/2&&z+r>b.z-b.d/2&&z-r<b.z+b.d/2);}
export function movePlayer(p,input,dt,platforms,colliders){
 const speed=input.sprint?5.8:3.8;let f=input.forward||0,s=input.side||0;const len=Math.hypot(f,s);if(len>1){f/=len;s/=len;}
 const dx=(-Math.sin(p.yaw)*f+Math.cos(p.yaw)*s)*speed*dt,dz=(-Math.cos(p.yaw)*f-Math.sin(p.yaw)*s)*speed*dt;
 if(!blocked(colliders,p.x+dx,p.z,p.y))p.x+=dx;if(!blocked(colliders,p.x,p.z+dz,p.y))p.z+=dz;
 const step=groundAt(platforms,p.x,p.z,p.y+.27);if(p.grounded&&step>p.y&&step-p.y<=.27)p.y=step;
 const oldY=p.y;p.vy-=18*dt;p.y+=p.vy*dt;const floor=groundAt(platforms,p.x,p.z,oldY+.07);
 if(p.vy<=0&&p.y<=floor&&oldY>=floor-.1){p.y=floor;p.vy=0;p.grounded=true;}else p.grounded=false;
 return Math.hypot(dx,dz);
}
export function jump(p){if(!p.grounded)return false;p.vy=7.8;p.grounded=false;return true;}
export function stairPlatforms(gap,count=4){const result=[];let end=7;for(let i=0;i<count;i++){const length=i===0?7:5.8;const start=end-length;result.push({x:0,z:(end+start)/2,w:4.8,d:length,y:i*.55,start,end,index:i});end=start-gap;}return result;}
