export default async function ReviewDetails({params,

} :{
    
    params : Promise<{id: string , reviewId:string}>;
})

{

const id = (await params).id;
const reviewId = (await params).reviewId;


    return <h1>Review {reviewId} for product {id}</h1>
}