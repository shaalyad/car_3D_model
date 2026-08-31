import { CarAnimation } from "../components/CarAnimation";

export default function CarPage() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 p-6">
      <h1 className="mb-6 text-3xl font-bold">Car Page</h1>
      <CarAnimation />
    </main>
  );
}
