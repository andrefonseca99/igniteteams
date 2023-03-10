import { Alert, FlatList, TextInput } from "react-native";
import { useEffect, useState, useRef } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";

import { Header } from "@components/Header";
import { Loading } from "@components/Loading";
import { Highlight } from "@components/Highlight";
import { ButtonIcon } from "@components/ButtonIcon";
import { Input } from "@components/Input";
import { Filter } from "@components/Filter";
import { PlayerCard } from "@components/PlayerCard";
import { ListEmpty } from "@components/ListEmpty";
import { Button } from "@components/Button";

import { Container, Form, HeaderList, PlayersCount } from "./styles";
import { AppError } from "@utils/AppError";
import { playerAddByGroup } from "@storage/player/playerAddByGroup";
import { playerGetByGroupAndTeam } from "@storage/player/playerGetByGroupAndTeam";
import { PlayerStorageDTO } from "@storage/player/PlayerStorageDTO";
import { playerRemoveByGroup } from "@storage/player/playerRemoveByGroup";
import { groupRemoveByName } from "@storage/group/groupRemoveByName";

type RouteParams = {
    group: string;
}

export function Players(){
    const [isLoading, setIsLoading] = useState(true);
    const [newPlayerName, setNewPlayerName] = useState('');
    const [team, setTeam] = useState('Time A');
    const [players, setPlayers] = useState<PlayerStorageDTO[]>([]);
    
    const newPlayerNameInputRef = useRef<TextInput>(null);

    const navigation = useNavigation();
    const route = useRoute();

    const { group } = route.params as RouteParams;

    async function handleAddPlayer(){
        if(newPlayerName.trim().length === 0){
            return Alert.alert("Nova pessoa", "Informe o nome da pessoa para adicionar.");
        }

        const newPlayer = {
            name: newPlayerName,
            team,
        }

        try {
            await playerAddByGroup(newPlayer, group);
            newPlayerNameInputRef.current?.blur();
            setNewPlayerName('');
            fetchPlayerByTeam();
        }catch(error){
            if(error instanceof AppError){
                Alert.alert("Nova pessoa", error.message);
            }else {
                console.error(error);
                Alert.alert("Nova pessoa", "N??o foi poss??vel adicionar.")
            }
        }
    }

    async function fetchPlayerByTeam(){
        try {
            setIsLoading(true);
            const playersByTeam = await playerGetByGroupAndTeam(group, team);
            setPlayers(playersByTeam);
        }
        catch(error){
            console.error(error);
            Alert.alert("Pessoas", "N??o foi poss??vel carregar as pessoas do time selecionado");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleRemovePlayer(playerName: string){
        try {
            await playerRemoveByGroup(playerName, group);
            fetchPlayerByTeam();
        }
        catch(error){
            console.error(error);
            Alert.alert("Remover pessoa", "N??o foi poss??vel remover essa pessoa.");
        }
    }

    async function groupRemove(){
        try {
            await groupRemoveByName(group);
            navigation.navigate("groups");
        }
        catch(error){
            console.error(error);
            Alert.alert("Remover turma", "N??o foi poss??vel remover a turma.");
        }
    }

    async function handleGroupRemove(){
        Alert.alert(
            "Remover",
            "Deseja remover a turma?",
            [
                { text: "N??o", style: "cancel" },
                { text: "Sim", onPress: () => groupRemove()},
            ]
        );
    }

    useEffect(() => {
        fetchPlayerByTeam();
    }, [team]);

    return (
        <Container>
            <Header showBackButton />

            <Highlight
                title={ group }
                subtitle="Adicione a galera e separe os times"
            />
            
            <Form>
                <Input
                    inputRef={newPlayerNameInputRef}
                    onChangeText={setNewPlayerName}
                    value={ newPlayerName }
                    placeholder="Nome da pessoa"
                    autoCorrect={false}
                    onSubmitEditing={handleAddPlayer}
                    returnKeyType="done"
                />
                <ButtonIcon 
                    icon="add"
                    onPress={handleAddPlayer}
                />
            </Form>
            <HeaderList>
                <FlatList
                    data={['Time A', 'Time B']}
                    keyExtractor={item => item}
                    renderItem={({ item }) => (
                        <Filter
                            title={item}
                            isActive={item === team}
                            onPress={() => setTeam(item)}
                        />
                    )}
                    horizontal
                />
                <PlayersCount>{players.length}</PlayersCount>
            </HeaderList>
            
            {
                isLoading ? <Loading /> :

                <FlatList
                    data={players}
                    keyExtractor={item => item.name}
                    renderItem={({ item }) => (
                        <PlayerCard 
                            name={item.name}
                            onRemove={() => handleRemovePlayer(item.name)}
                        />  
                    )}
                    ListEmptyComponent={() => (
                        <ListEmpty 
                        message="N??o h?? pessoas nesse time." 
                        />
                    )}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[
                        { paddingBottom: 100 },
                        players.length === 0 && { flex: 1}
                    ]}
                />
            }
            <Button
                title="Remover turma"
                type="SECONDARY"
                onPress={handleGroupRemove}
            />
        </Container>
    )
}