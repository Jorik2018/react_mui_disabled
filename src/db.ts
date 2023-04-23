import Dexie from 'dexie';

import { http } from 'gra-react-utils';

export const db:any = new Dexie('minsa');
db.version(3).stores({
  disabled: '++id', // Primary key and indexed props
  region:'code',
  province:'code',
  district:'code',
  red:'code',
  microred:'code'
});
let loader:any={
  red:"/api/grds/red/0/0",
  microred:"/api/grds/microred/0/0",
  region:"/admin/directory/api/region/0/0",
  province:"/admin/directory/api/province/0/0",
  district:"/admin/directory/api/district/0/0"
}
export function retrieve(store:any,setter:any,force?:any){
  db[store].toArray().then((e:any)=>{
    if(!e.length||force)
      http.get(loader[store]).then(function(data:any){
        var table=db[store];
        table.clear().then(()=>{
          data=data.data||data;
          table.bulkAdd(data).then((/*lastKey:any*/)=>{
            
            if(setter){setter(data);}
          }).catch( (e:any)=> {
            console.log(e)
          });
        });
      });
    else
      if(setter){setter(e);}
  });
}
