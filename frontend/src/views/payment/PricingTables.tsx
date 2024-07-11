import * as React from 'react'

export default function PricingTable() {
    // Paste the stripe-pricing-table snippet in your React component
    return (
        <div className="p-10 m-10">
            <stripe-pricing-table
                pricing-table-id="prctbl_1OgBC0DBobJQGO0bczWn7PT5"
                publishable-key="pk_test_51OfU0yDBobJQGO0b4jI5wUeLJ69qqEFzgA0FZHfPa7eSz5CbUHcjZiSgw56Bl4dztwqKLobBdB85W2N7utLCz6vD00QtBnSvAl"
            ></stripe-pricing-table>
        </div>
    )
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'stripe-pricing-table': React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement>,
                HTMLElement
            >
        }
    }
}
