import * as bio from './bio.js';
import * as events from './events.js';
import * as featured from './featured.js';
import * as help from './help.js';
import * as photo from './photo.js';
import * as photos from './photos.js';
import * as resolve from './resolve.js';
import * as room from './room.js';
import * as roomphotos from './roomphotos.js';
import * as rooms from './rooms.js';
import * as search from './search.js';
import * as user from './user.js';

export const commands = [help, user, bio, search, resolve, room, rooms, roomphotos, photo, photos, events, featured];
export const byName = new Map(commands.map((command) => [command.data.name, command]));
export const definitions = commands.map((command) => command.data);
