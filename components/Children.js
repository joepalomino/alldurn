import React, { Component } from 'react';
import { TextInput, Button, View, Text } from 'react-native';
import gql from 'graphql-tag';
import { Mutation, graphql } from 'react-apollo';
import { FlatList } from 'react-native';

const addChild = gql`
  mutation addChild($name: String!, $age: Int!, $userEmail: String!) {
    createChild(
      data: {
        name: $name
        age: $age
        parent: { connect: { email: $userEmail } }
      }
    ) {
      id
    }
  }
`;

const removeChild = gql`
  mutation removeChild($id: ID!) {
    deleteChild(where: { id: $id }) {
      id
      name
    }
  }
`;

const childQuery = gql`
  query {
    children {
      id
      name
      age
    }
  }
`;
const Child = graphql(childQuery)(props => {
  const { error, children } = props.data;

  if (error) {
    <Text>{error}</Text>;
  }

  if (children) {
    return (
      <View>
        <FlatList
          data={children}
          renderItem={({ item }) => (
            <View>
              <Text key={item.id}>
                {item.name}, {item.age}
              </Text>
              <RemoveChildButton id={item.id} />
            </View>
          )}
        />
      </View>
    );
  }

  return <Text>...Loading</Text>;
});

function RemoveChildButton(props) {
  const handleSubmit = mutationFn => {
    mutationFn({
      variables: {
        id: props.id
      }
    })
      .then(res => res)
      .catch(err => <Text>{err}</Text>);
  };
  return (
    <Mutation mutation={removeChild} refetchQueries={[{ query: childQuery }]}>
      {(removeChildMutation, { data }) => (
        <Button
          onPress={() => handleSubmit(removeChildMutation)}
          title="Remove"
        />
      )}
    </Mutation>
  );
}
export default class NewChild extends Component {
  state = {
    name: '',
    age: '',
    userEmail: 'palominojoen@gmail.com'
  };

  handleInputChange = e => {
    const { rel, value } = e.target;
    this.setState({ rel: value });
  };

  handleSubmit = mutationFN => {
    const { name, age, userEmail } = this.state;
    mutationFN({
      variables: {
        name,
        age: parseInt(age),
        userEmail
      }
    })
      .then(res => res)
      .catch(err => <Text>{err}</Text>);
    this.setState({ name: '', age: '' });
  };

  render() {
    const { name, age } = this.state;
    return (
      <Mutation mutation={addChild} refetchQueries={[{ query: childQuery }]}>
        {(addChildMutation, { data }) => (
          <View>
            <Text>Child Data:</Text>
            <TextInput
              placeholder="First Name"
              onChangeText={text => this.setState({ name: text })}
              rel="name"
              value={name}
            />
            <TextInput
              placeholder="Age"
              keyboardType="numeric"
              onChangeText={text => this.setState({ age: text })}
              rel="age"
              value={age}
            />
            <Button
              onPress={() => this.handleSubmit(addChildMutation)}
              title="Add Child"
              color="#ffb199"
            />
            <Child />
          </View>
        )}
      </Mutation>
    );
  }
}
