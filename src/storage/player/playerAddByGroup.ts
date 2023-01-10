import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppError } from "@utils/AppError";

import { PLAYER_COLLECTION } from "@storage/storageConfig";
import { playersGetByGroup } from "./playersGetByGroup";
import { PlayerStorageDTO } from "./PlayerStorageDTO";

export async function playerAddByGroup(newPlayer: PlayerStorageDTO, group: string){
    try{
        const storagePlayers = await playersGetByGroup(group);

        const playerAlreadyExists = storagePlayers.filter(player => player.name === newPlayer.name);
        
        if(playerAlreadyExists.length > 0){
            throw new AppError("Essa pessoa já está adiciona em um time!");
        }
        
        const storage = JSON.stringify([...storagePlayers, newPlayer]);

        await AsyncStorage.setItem(`${PLAYER_COLLECTION}-${group}`, storage);
    }catch (error){
        throw (error);
    }
}