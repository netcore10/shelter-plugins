import TagStyler from "./TagStyler";

const {
  ui: { openModal },
} = shelter;

// Its own module so TagEditor and TagManager can both open the styler without
// importing each other.
export const openStyler = (tag) =>
  openModal((props) => <TagStyler tag={tag} close={props.close} />);
