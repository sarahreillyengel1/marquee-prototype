import { CollectionPage, collectionMetadata } from "../Collection";
export const dynamic = "force-dynamic";
export const metadata = collectionMetadata("startups");
export default function Page() { return <CollectionPage keyName="startups" />; }
