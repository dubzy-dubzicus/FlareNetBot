import * as help from './help.js';
import * as photo from './photo.js';
import * as photos from './photos.js';
import * as room from './room.js';
import * as rooms from './rooms.js';
import * as search from './search.js';
import * as user from './user.js';

export const commands = [help, user, search, room, rooms, photo, photos];
export const byName = new Map(commands.map((command) => [command.data.name, command]));
export const definitions = commands.map((command) => command.data);
