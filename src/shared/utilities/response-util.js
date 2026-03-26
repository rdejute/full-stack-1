/**
 * Utility object for standardizing HTTP response formats.
 * Provides consistent response structures for success and error cases.
 */
export const ResponseUtil = {
  respondOk: (res,data,message)=>{
    res.json({type:'success',data,message});
  },
  respondError: (res,data,message)=>{
    res.json({type:'error',data,message});
  }
};