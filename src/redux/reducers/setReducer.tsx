import Globals from '../../Globals';
import { Settings } from '../../models/Settings';

// Used to store settings. They will be saved to file.
export default function reducer(state = new Settings(), action: any) {
  var newSettings = { ...state };
  switch (action.type) {
    case "LOAD_SETTINGS":
      newSettings = JSON.parse(localStorage.getItem(Globals.storeFile)!).settings;
      break;
    case "SET_KEY_VAL":
      var key = action.key;
      var val = action.val;
      switch (key) {
        case 'theme': {
          document.body.classList.forEach((val) => {
            if (/theme/.test(val)) {
              document.body.classList.remove(val);
            }
          });
          document.body.classList.toggle(`theme${val}`, true);
          break;
        }
      }

      (newSettings as any)[key] = val;
      localStorage.setItem(Globals.storeFile, JSON.stringify({ settings: newSettings }));
      break;
    // @ts-ignore
    case "DEFAULT_SETTINGS":
      newSettings = new Settings();
      break;
    // eslint-disable-next-line
    default:
      if (Object.keys(newSettings).length === 0) {
        newSettings = new Settings();
      }
      const defaultSettings = new Settings();
      Object.keys(defaultSettings).forEach(key => {
        if ((newSettings as any)[key] === undefined) {
          (newSettings as any)[key] = (defaultSettings as any)[key];
        }
      });
  }
  return newSettings;
}
