import { CollectionPage, collectionMetadata } from "../Collection";
export const dynamic = "force-dynamic";
export const metadata = collectionMetadata("consulting");
export default function Page() { return <CollectionPage keyName="consulting" />; }
