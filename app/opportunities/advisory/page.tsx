import { CollectionPage, collectionMetadata } from "../Collection";
export const dynamic = "force-dynamic";
export const metadata = collectionMetadata("advisory");
export default function Page() { return <CollectionPage keyName="advisory" />; }
