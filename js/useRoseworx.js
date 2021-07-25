import {useRef, useEffect} from 'react';
const useRoseworx = (c, i) => {
  const type = useRef(c);
  const id = useRef(i)
  useEffect(()=>{
    const t = type;
    const aid = id;
    t.current && t.current.hook && t.current.hook(aid.current);
    return ()=>{
      t.current && t.current.unhook && t.current.unhook(aid.current);
    }
  },[]);
}

export default useRoseworx;