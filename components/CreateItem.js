import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import Router from 'next/router';
import gql from 'graphql-tag';
import Form from './styles/Form';
import formatMoney from '../lib/formatMoney';
import Error from './ErrorMessage';


const CREATE_ITEM_MUTATION = gql`
		mutation CREATE_ITEM_MUTATION(
			$title: String!
			$description:String!
			$price: Int!
			$image: String
			$largeImage: String
			) {
			createItem(
			title: $title
			description: $description
			price: $price
			image: $image
			largeImage: $largeImage
			){
			id
			}
			}
`;

class CreateItem extends Component {
	state ={
		title: '',
		description: '',
		image: '',
		largeImage: '',
		price: 0
	};
	handleChange = (event) => {
		const {name, type, value } = event.target
		const val = type == 'number' ? parseFloat(value) : value
		this.setState({
			[name]: val
		})
	}

	uploadFile = async (e) =>{
		console.log("Uploading File")
		const files = e.target.files;
		const data = new FormData();
		data.append('file', files[0])
		data.append('upload_preset','sickfits')
		const res = await fetch ('https://api.cloudinary.com/v1_1/mariachi-io-daniel/image/upload', {
			method: 'POST',
			body: data
		});
		const file = await res.json();
		this.setState({
			image: file.secure_url,
			largeImage: file.eager[0].secure_url
		})
	}
	render () {
		return (
			<Mutation mutation={CREATE_ITEM_MUTATION} variables={this.state} >
				{(createItem, {loading, error}) => (
					<Form onSubmit={ async (e) => {
						//Stop the form from submitting
						e.preventDefault()
						//call the mutation
						const res = await createItem()
						//change them to the item page
						console.log(res)
						Router.push({
							pathname: '/item',
							query:{ id: res.data.createItem.id }
						})
					}}>
						<Error error={error}/>
						<fieldset disable={loading} aria-busy={loading}>
							<label htmlFor="file">
								Title
								<input
									type="file"
									id="file"
									name="file"
									placeholder="Upload an Image"
									onChange={this.uploadFile}
								/>
								{this.state.image && <img width="200" src={this.state.image} alt="Upload preview"/>}
							</label>
							<label htmlFor="title">
								Title
								<input
									type="text"
									id="title"
									name="title"
									placeholder="Title"
									required value={this.state.title}
									onChange={this.handleChange}
								/>
							</label>
							<label htmlFor="price">
								Price
								<input
									type="number"
									id="price"
									name="price"
									placeholder="Price"
									required value={this.state.price}
									onChange={this.handleChange}
								/>
							</label>
							<label htmlFor="description">
								Description
								<textarea
									id="description"
									name="description"
									placeholder="Enter a description"
									required value={this.state.description}
									onChange={this.handleChange}
								/>
							</label>
							<button type="submit">Submit</button>
						</fieldset>
					</Form>
				)}
			</Mutation>
		);
	}
}

export default CreateItem;
export {CREATE_ITEM_MUTATION};
