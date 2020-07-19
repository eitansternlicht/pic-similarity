import React, {Component} from 'react';
import {
  Button,
  View,
  Image,
  ActivityIndicator,
  Text,
  ScrollView,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import axios from 'axios';
import {API} from '../../config/GoogleVision';
import {SERVER_URL} from '../../utils/consts';
// More info on all the options is below in the API Reference... just some common use cases shown here
const options = {
  title: 'Select Avatar',
  customButtons: [{name: 'fb', title: 'Choose Photo from Facebook'}],
  storageOptions: {
    skipBackup: true,
    path: 'images',
  },
};

/**
 * The first arg is the options object for customization (it can also be null or omitted for default options),
 * The second arg is the callback which sends object: response (more info in the API Reference)
 */

class App extends Component {
  state = {
    avatarSource: null,
    loadingSearchImage: false,
  };
  onClickSelectImg() {
    this.setState({loadingSearchImage: true});
    ImagePicker.showImagePicker(options, (response) => {
      //console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const source = {uri: response.uri};

        // You can also display the image using data:
        // const source = { uri: 'data:image/jpeg;base64,' + response.data };
        //console.log('data:image/jpg;base64,' + response.data);
        this.setState({
          avatarSource: {
            uri: 'data:image/jpg;base64,' + response.data,
          },
          loadingSearchImage: false,
          searchImageLabelAnnotations: [],
          queryResults: null,
          loadingQuery: false,
        });
        const reqBody = {
          requests: [
            {
              image: {
                content: response.data,
              },
              features: [
                {
                  type: 'LABEL_DETECTION',
                },
              ],
            },
          ],
        };
        // console.log('request body', reqBody);
        // fetch('https://vision.googleapis.com/v1/images:annotate?key=' + API, {
        //   method: 'POST',
        //   body: reqBody,
        // })
        //   .then((response) => {
        //     return response.json();
        //   })
        //   .catch((err) => console.error(error))
        //   .then((response) => {
        //     console.log('rrummmmmmmmchama', response, API);
        //   })
        //   .catch((err) => console.error(error));
        this.setState({
          searchImageLabelAnnotations: null,
        });
        axios
          .post(
            'https://vision.googleapis.com/v1/images:annotate?key=' + API,
            reqBody,
          )
          .then(
            (res) => {
              if (res) {
                const {labelAnnotations} = res.data.responses[0];
                console.log('Google vision results', labelAnnotations);
                this.setState({
                  searchImageLabelAnnotations: labelAnnotations,
                });
                this.setState({
                  loadingQuery: true,
                });
                axios
                  .post(`${SERVER_URL}/query-annotations`, labelAnnotations)
                  .then(
                    (queryResults) => {
                      console.log('queryResults', queryResults.data);
                      this.setState({
                        queryResults: queryResults.data,
                        loadingQuery: false,
                      });
                    },
                    (errpr) => console.error(errpr),
                  );
              }
            },
            (errpr) => console.error(errpr),
          );
      }
    });
  }
  render() {
    return (
      <View style={{paddingTop: 50}}>
        <Button
          onPress={() => this.onClickSelectImg()}
          title="Learn More"
          color="#841584"
          accessibilityLabel="Learn more about this purple button"
        />
        {this.state.loadingSearchImage ? (
          <ActivityIndicator />
        ) : this.state.avatarSource ? (
          <Image
            style={{width: '90%', height: '50%'}}
            source={this.state.avatarSource}
          />
        ) : null}
        {this.state.loadingQuery ? (
          <View>
            <Text>Searching for similar images</Text>
            <ActivityIndicator />
          </View>
        ) : this.state.queryResults ? (
          <ScrollView>
            <View>
              <Text>TF-IDF Results</Text>
              {this.state.queryResults.tfIdf.body.hits.hits.map(
                ({_source: {image_path}}) => (
                  <Image
                    key={'tfIdf' + image_path}
                    style={{height: '50%', width: '90%'}}
                    source={{uri: `${SERVER_URL}/image-storage/${image_path}`}}
                  />
                ),
              )}
              <Text>Doc2Vec Results</Text>
              {this.state.queryResults.doc2vec.body.hits.hits.map(
                ({_source: {image_path}}) => (
                  <Image
                    key={'doc2vec' + image_path}
                    style={{height: '50%', width: '90%'}}
                    source={{uri: `${SERVER_URL}/image-storage/${image_path}`}}
                  />
                ),
              )}
            </View>
          </ScrollView>
        ) : null}
      </View>
    );
  }
}

export default App;
