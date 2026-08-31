export default async function Docs({ 
    params , }

: {params : Promise<{slug :string[]}>}



){
    const {slug} = await params ;
    if(slug.length === 2){
        <h1>Viewing doc of {slug[0]} of concept {slug[1]}</h1>
    }
    return <h1>Doc</h1>
}