export const THEMES = [
  {
    id: "tung",
    name: "tung tung sahur",
    img: "/themes/tung.jpeg",
    ext: "jpeg",
  },
  {
    id: "tralla",
    name: "tralalero tralala",
    img: "/themes/tralla.png",
    ext: "png",
  },
  {
    id: "chimpi",
    name: "chimpanzini bananini",
    img: "/themes/chimpi.png",
    ext: "png",
  },
];

interface ThemesProps {
  currentTheme: string;
  onSelect: (id: string) => void;
}

export function Themes({ currentTheme, onSelect }: ThemesProps) {
  return (
    <div style={{padding:"16px",color:"#ccc",fontFamily:"inherit"}}>
      <p style={{fontSize:"11px",color:"#555",marginBottom:"14px"}}>background theme</p>
      <div style={{display:"flex",flexWrap:"wrap" as const,gap:"12px"}}>
        {THEMES.map(theme => (
          <div key={theme.id} onClick={()=>onSelect(theme.id)}
            style={{cursor:"pointer",width:"130px"}}>
            <div style={{
              position:"relative" as const,
              width:"130px",height:"80px",overflow:"hidden",
              border:"2px solid",
              borderColor: currentTheme===theme.id ? "#ff4d6d" : "#2a2a2a",
              borderRadius:"4px",
            }}>
              <img
                src={`data:image/${theme.ext};base64,${theme.img}`}
                style={{width:"100%",height:"100%",objectFit:"cover",filter:"brightness(0.7)"}}
                alt={theme.name}
              />
              {currentTheme===theme.id && (
                <div style={{position:"absolute" as const,top:"4px",right:"4px",background:"#ff4d6d",borderRadius:"50%",width:"10px",height:"10px"}}/>
              )}
            </div>
            <p style={{fontSize:"11px",marginTop:"5px",color:currentTheme===theme.id?"#ff4d6d":"#888",textAlign:"center" as const}}>
              {theme.name}
            </p>
          </div>
        ))}
        <div style={{width:"130px"}}>
          <div style={{
            width:"130px",height:"80px",
            border:"2px dashed #2a2a2a",
            borderRadius:"4px",
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
          }}>
            <span style={{fontSize:"10px",color:"#444",textAlign:"center" as const}}>more<br/>coming soon</span>
          </div>
          <p style={{fontSize:"11px",marginTop:"5px",color:"#444",textAlign:"center" as const}}>???</p>
        </div>
      </div>
    </div>
  );
}
