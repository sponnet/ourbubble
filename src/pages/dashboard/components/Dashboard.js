import React from "react";
import { connect } from "react-redux";

const Comp = ({ bubble, close, addClose, changeClose, deleteClose, extended, changeExtended, deleteExtended }) => {

    const contactList = (list, onChange, onDelete, normalmax) => {
        if (!list) return null;
        const existing = list.map((closeItem, index) => {
            const extraClass = (index >= normalmax) ? "is-danger" : "";
            return (
                <div key={`close-${index}`} className="field has-addons">
                    <div className="control is-expanded">
                        <input className={`input ${extraClass}`} value={closeItem.name||""} onChange={(e) => { onChange(index, e.target.value) }} type="text" placeholder="Naam Achternaam" />
                    </div>
                    {index >= normalmax && (
                        <div className="control">
                            <button onClick={() => { onDelete(index) }} className="button">-</button>
                        </div>
                    )}
                </div>
            )
        });
        return ([
            ...existing,
            (
                <button className="button" key="add" onClick={addClose}>contact toevoegen</button>
            )
        ])
    }

    const closeContacts = () => {
        return contactList(close, changeClose, deleteClose, bubble.numclose);
    }
    const extendedContacts = () => {
        return contactList(extended, changeExtended, deleteExtended, bubble.numextended);
    }

    return (
        <div className="ryo-container">
            <h2>Onze Bubbel</h2>
            <div className="content">
                {/* <p>Dit is mijn bubbel</p> */}
                <h3 className="has-text-white">Nauwe contacten</h3>

                {closeContacts()}

                <h3 className="has-text-white">Bredere contacten</h3>
                <div className="field">
                    {extendedContacts()}
                </div>
            </div>
        </div>
    )

};

const mapStateToProps = state => {
    // debugger;
    return {
        // ...state.investments,
        // members: state.main.members,
        bubble: state.main.bubble,
        close: state.main.bubble.close,
        extended: state.main.bubble.extended,
        // poolmembers: state.main.poolmembers,
    };
};

const mapDispachToProps = dispatch => {
    return {
        addClose: (name) => dispatch({ type: "ADDCLOSE", name: name }),
        changeClose: (index, name) => dispatch({ type: "CHANGECLOSE", index: index, changes: { name: name } }),
        deleteClose: (index, name) => dispatch({ type: "DELETECLOSE", index: index }),
        changeExtended: (index, name) => dispatch({ type: "CHANGEEXTENDED", index: index, changes: { name: name } }),
        deleteExtended: (index, name) => dispatch({ type: "DELETEEXTENDED", index: index }),
    };
};

export default connect(
    mapStateToProps,
    mapDispachToProps
)(Comp);
