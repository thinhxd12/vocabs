import { UnLazyImage } from "@unlazy/solid";
import { Component } from "solid-js";


const Text: Component<{}> = (props) => {
    return (
        <div style={{
            width: '360px',
            height: '202px'
        }}
            class="abc"
        >
            <UnLazyImage
                blurhash="LKO2:N%2Tw=w]~RBVZRi};RPxuwH"
                // thumbhash="1QcSHQRnh493V4dIh4eXh1h4kJUI"
                src="https://images.unsplash.com/photo-1731491895205-efb4def35547?q=80&w=1633&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                width={360}
                height={202}
            />
        </div>
    );
};

export default Text;