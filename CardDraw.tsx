import * as React from 'react';
import './Drawer.scss';
import { Http2ServerResponse } from 'http2';
import { delay } from 'q';

interface IState {
  selectedCards: [];
  selectedCardsUris: [];
  numMulls: number;
}

interface IProps {
  deck: Object[];
  londonMulligan: boolean;
}

class Drawer extends React.Component<IProps, {}> {
  public drawSize: number = 7;
  public readonly state: Readonly<IState> = {
    selectedCards: [],
    selectedCardsUris: [],
    numMulls: 0,
  };

  private static defaultProps = {
    deck: [{}],
    londonMulligan: true,
  };

  public componentDidMount() {
    this.drawCards();
  }

  public shuffle = (array: string[]) => {
    let currentIndex: number = array.length;
    let temporaryValue: string = '';
    let randomIndex: number = 0;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  };

  public drawCards = async () => {
    let drawedCards: string[] = [];
    const cardsToDraw = this.drawSize - this.state.numMulls;
    const flattenedDeck: string[] = [];
    await this.props.deck.map((card: any) => {
      for (let i = 0; i <= card.amount - 1; i += 1) {
        flattenedDeck.push(card.id);
      }
    });

    if (this.props.londonMulligan) {
      // London Mulligan
      drawedCards = await this.shuffle(flattenedDeck).slice(0, 7);
    }

    if (!this.props.londonMulligan) {
      // Vancouver Mulligan (not done in render yet)
      drawedCards = await this.shuffle(flattenedDeck).slice(0, cardsToDraw);
    }

    await this.setState({ selectedCards: drawedCards });
    this.getCardImages(this.state.selectedCards);
  };

  public getCardImages = async (cardIds: string[]): Promise<void> => {
    this.setState({ selectedCardsUris: [] });

    await cardIds.reduce((ids, id) => {
      return ids.then(() => {
        return new Promise((resolve: any) => {
          setTimeout(() => {
            resolve(
              fetch(`https://api.scryfall.com/cards/${id}`)
                .then((response: Response) => response.json())
                .then((response): any =>
                  this.setState({ selectedCardsUris: [...this.state.selectedCardsUris, response.image_uris.normal] }),
                ),
            );
          }, 200);
        });
      });
    }, Promise.resolve());
  };

  public takeMulligan = async () => {
    await this.setState({ numMulls: this.state.numMulls + 1 });
    this.drawCards();
  };

  public render() {
    return (
      <div>
        <p>Draw</p>
        <button onClick={() => this.takeMulligan()}>Mull to {this.drawSize - this.state.numMulls - 1}</button>
        <div className="drawer-card-wrapper">
          {this.props.londonMulligan ? (
            this.state.selectedCardsUris.length >= 7 ? (
              this.state.selectedCardsUris.map((uri: any) => <img src={uri} key={Math.random()} alt=""></img>)
            ) : (
              <p>Loading...</p>
            )
          ) : this.state.selectedCardsUris.length === this.drawSize - this.state.numMulls ? (
            this.state.selectedCardsUris.map((uri: any) => <img src={uri} key={Math.random()} alt=""></img>)
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    );
  }
}

export default Drawer;
