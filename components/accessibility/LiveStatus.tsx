export default function LiveStatus({message}:{message:string}){return <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">{message}</p>;}
