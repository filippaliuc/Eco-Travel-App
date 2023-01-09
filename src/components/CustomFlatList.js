import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native';

let id = null;
function setId(goodid) {
    id = goodid;
}

export function getId() {
    return id
}

const CustomFlatList = ({data, isTicket, showToast, showCard}) => {

    const navigation = useNavigation();
    const [selectedId, setSelectedId] = useState(null)

    
    const Item = ({item, onPress, borderColor, textColor, elevation, borderWidth, shadowOpacity}) => (
        <TouchableOpacity 
          onPress={onPress}
          style={[styles.item, borderColor, elevation, borderWidth, shadowOpacity]}
          activeOpacity={0.7}
        >
          <Text style={[styles.itemText, textColor]}>{item.name}</Text>
        </TouchableOpacity>
    );
    
    const renderItem = ({ item }) => {
        const borderColor = item.key === selectedId ? "#196220" : null;
        const color = item.key === selectedId ? "black" : "grey";
        const elevation = item.key === selectedId ? 10 : 0;
        const shadowOpacity = item.key === selectedId ? 0.3 : 0;
        const borderWidth = item.key === selectedId ? 2 : 0;
        
        return (
            <Item
                item={item}
                onPress={() => {setSelectedId(item.key);setId(item.key);}}
                borderColor={{ borderColor }}
                elevation={{ elevation }}
                shadowOpacity={{ shadowOpacity }}
                textColor={{ color }}
                borderWidth={{ borderWidth }}
            />
        );
    };

    const handleConfirm = () => {
        return data[selectedId-1].name === 'reduceri/gratuitati' ? navigation.navigate("ConfirmStudentPassScreen",selectedId) : navigation.navigate("ConfirmStandardPassScreen",selectedId) 
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(item) => item.key}
                extraData={selectedId}
                contentContainerStyle={styles.buttonsContainer}
            />
            {selectedId &&  data[selectedId-1].price != '0' && (
                <Text style={styles.price}>{data[selectedId-1].price} lei</Text>
            )}
            {   
                selectedId && 
                <TouchableOpacity 
                    style={styles.chooseButton}   
                    onPress={isTicket ? showCard : handleConfirm}
                >
                    <Text style={styles.chooseText}>{isTicket ? "Cumpara" : "Confimra"}</Text>
                </TouchableOpacity> 
                || 
                !selectedId && 
                <TouchableOpacity 
                    style={[styles.chooseButton,{backgroundColor: "#DDD8D8"}]} 
                    activeOpacity={0.8}
                    onPress={showToast}
                >
                    <Text style={[styles.chooseText, {color:"black"}]} >{isTicket ? "Cumpara" : "Confimra"}</Text>
                </TouchableOpacity> 
            }
        </View>
    )
}

export default CustomFlatList

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: '6%', 
        justifyContent: 'flex-end',
        backgroundColor: "white",
        alignItems: "center",
    },
    
    buttonsContainer: {
        alignItems: "center",
        // backgroundColor: 'grey',
    },

    chooseButton: {
        backgroundColor: "#279032",
        paddingHorizontal: '15%',
        paddingVertical:'5%',
        alignItems: "center",
        borderRadius: 20,
        marginBottom: 30,
        marginTop: 15,
        elevation: 4,
        shadowOpacity: 0.2
    },

    chooseText: {
        color: "white",
        fontSize: 20,
        fontWeight: "600"
    },
    
    item: {
        backgroundColor: "#EFEAEA",
        width: 300,
        maxWidth: '80%',
        paddingVertical: 18,
        alignItems: "center",
        borderRadius: 20,
        marginTop: 30,
    },

    itemText: {
        fontSize: 16, 
        fontWeight: '500'
    },

    price: {
        fontSize: 20, 
        fontWeight: '500',
        color: 'black',
        padding: 10,
    },
})