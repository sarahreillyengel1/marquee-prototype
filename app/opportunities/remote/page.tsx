import { CollectionPage, collectionMetadata } from "../Collection";
export const dynamic = "force-dynamic";
export const metadata = collectionMetadata("remote");
export default function Page() { return <CollectionPage keyName="remote" />; }
