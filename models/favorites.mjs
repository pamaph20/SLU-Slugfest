import { getUser } from "./user.mjs";
import { getSlime } from "./statuses.mjs"


// get a list of the user's favorited slimes 
export async function getUserFavorites(identifier, count, authenticatedUser) {
    let user = await getUser(identifier);

    // pull user favorites list out of the user obejct
    let favorited_slimes = user.favorited_slimes;

    // check if no favorited slimes
    if (!favorited_slimes) {
        return [];
    }

    let slimes_list = await Promise.all(favorited_slimes.map(async (slime) => {
        return await getSlime(slime, authenticatedUser);
    }));
    return slimes_list.slice(0, count);
}