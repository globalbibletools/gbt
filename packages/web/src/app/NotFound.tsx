import { useRouteError } from "react-router-dom";

export default function NotFound() {
  const error: any = useRouteError()
  console.error(error);

  return <div className="absolute w-full h-full flex flex-col items-center justify-center">
    <h1 className="font-bold text-xl mb-6">Woops!</h1>
    <p className="mb-2">We couldn't find what you are looking for</p>
    <p className="italic">
      {error.statusText || error.message}
    </p>
  </div>
}