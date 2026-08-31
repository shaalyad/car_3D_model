export default async function ProductDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
    const id = (await params).id;

  return <h1>Product detail about {id}</h1>;
}
