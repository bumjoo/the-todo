import React from "react";
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TextInput,
  Dimensions,
  Platform,
  ScrollView,
  AsyncStorage
} from "react-native";
import ToDo from "./ToDo";
import { AppLoading } from "expo";
import uuidv1 from "uuid/v1";

const { width, height } = Dimensions.get("window");
console.log("startt!!!!!!");

export default class App extends React.Component {
  state = {
    newToDo: "",
    loadedToDos: false,
    toDos: {}
  };
  componentDidMount = () => {
    this._loadToDos();
  };
  render() {
    const { newToDo, loadedToDos, toDos } = this.state;
    console.log(this.state);
    if (!loadedToDos) {
      return <AppLoading />;
    }

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.title}>연습 To Do..</Text>
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder={"새 할일 입력"}
            value={newToDo}
            onChangeText={this._crontollNewToDo}
            placeholderTextColor={"#999"}
            returnKeyType={"done"}
            autoCorrect={false}
            onSubmitEditing={this._addToDo}
          />
          <ScrollView contentContainerStyle={styles.toDos}>
            {Object.values(toDos)
              .reverse()
              .map(toDo => (
                <ToDo
                  key={toDo.id}
                  {...toDo}
                  deleteToDo={this._deleteToDo}
                  completeToDo={this._completeToDo}
                  uncompleteToDo={this._uncompleteToDo}
                  updateToDo={this._updateToDo}
                />
              ))}
          </ScrollView>
        </View>
      </View>
    );
  }
  _crontollNewToDo = text => {
    //console.log(this.state);
    this.setState({
      newToDo: text
    });
  };
  _loadToDos = async () => {
    try {
      const toDos = await AsyncStorage.getItem("toDos");
      console.log("======");
      console.log(toDos);
      const parsedToDos = {};
      if (toDos) {
        parsedToDos = JSON.parse(toDos);
      }
      this.setState({
        loadedToDos: true,
        toDos: parsedToDos
      });
    } catch (err) {
      console.log("error !!!!");
      console.log(err);
    }
  };
  _addToDo = () => {
    const { newToDo } = this.state;
    if (newToDo !== "") {
      this.setState(prevState => {
        const ID = uuidv1();
        const newToDoObject = {
          [ID]: {
            id: ID,
            isCompleted: false,
            text: newToDo,
            createAt: Date.now()
          }
        };
        const newState = {
          ...prevState,
          newToDo: "",
          toDos: {
            ...prevState.toDos,
            ...newToDoObject
          }
        };
        this._saveToDos(newState.toDos);
        return { ...newState };
      });
    }
  };
  _deleteToDo = id => {
    this.setState(prevState => {
      const { toDos } = prevState;
      delete toDos[id];
      const newState = {
        ...prevState,
        toDos
      };
      this._saveToDos(newState.toDos);

      return { ...newState };
    });
  };
  _completeToDo = id => {
    this.setState(prevState => {
      const newToDo = {
        ...prevState.toDos[id],
        isCompleted: true
      };
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos,
          [id]: newToDo
        }
      };
      this._saveToDos(newState.toDos);

      return { ...newState };
    });
  };
  _uncompleteToDo = id => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos,
          [id]: {
            ...prevState.toDos[id],
            isCompleted: false
          }
        }
      };
      this._saveToDos(newState.toDos);

      return newState;
    });
  };
  _updateToDo = (id, text) => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos,
          [id]: {
            ...prevState.toDos[id],
            text: text
          }
        }
      };
      this._saveToDos(newState.toDos);
      return newState;
    });
  };
  _saveToDos = newToDos => {
    console.log(JSON.stringify(newToDos));
    const strNewToDos = JSON.stringify(newToDos);
    const saveToDos = AsyncStorage.setItem("toDos", strNewToDos);
  };
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f23657",
    alignItems: "center"
  },
  title: {
    color: "white",
    fontSize: 30,
    marginTop: 50,
    fontWeight: "300",
    marginBottom: 30
  },
  card: {
    backgroundColor: "white",
    flex: 1,
    width: width - 20,
    //    marginBottom: 30,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    //    borderBottomLeftRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: "rgb(50,50,50)",
        shadowOpacity: 0.5,
        shadowRadius: 5,
        shadowOffset: {
          widht: 100,
          height: -3
        }
      },
      android: {
        elevation: 3
      }
    })
  },
  input: {
    padding: 20,
    borderBottomColor: "#bbb",
    borderBottomWidth: 2,
    fontSize: 20 // StyleSheet.hairlineWidth
  },
  toDos: {
    alignItems: "center"
  }
});
